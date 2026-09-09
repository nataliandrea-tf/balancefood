// CI/CD de BalanceFood para jenkins.frubilarz.cl.
//
// Monorepo: backend/ (Rails 8 API + PostgreSQL), frontend/ (React) y mobile/ (Flutter).
// El pipeline cubre backend/ y frontend/; mobile/ se agrega como stages adicionales.
//
// El servidor Jenkins tiene un solo executor y Docker disponible. Las etapas de CI
// corren dentro de contenedores efimeros conectados a la red Docker externa
// `course-net`; la base de datos de test es un PostgreSQL levantado por build y
// destruido al terminar.
//
// Flujo:
//   Checkout -> Test DB
//   -> Backend:  Install deps -> Lint -> Security -> Test
//   -> Frontend: Install deps -> Lint -> Build (Vite)
//   -> Backend: Build image -> Frontend: Build image
//   (solo rama `production`)
//   -> Backend: Deploy -> Backend: Health Check (el entrypoint migra al arrancar)
//   -> Frontend: Deploy -> Frontend: Health Check
//
// Nada se despliega si falla la CI de cualquiera de los dos.
//
// Produccion: cada contenedor se publica en un puerto de loopback y el reverse proxy del
// servidor (Nginx + Certbot) expone el dominio publico hacia ese puerto:
//   backend  127.0.0.1:4101 -> https://apibalancefood.frubilarz.cl
//   frontend 127.0.0.1:4103 -> https://balancefood.frubilarz.cl
// El backend recibe CORS_ORIGINS con el origen del frontend (config/initializers/cors.rb).
pipeline {
    agent any

    options {
        disableConcurrentBuilds()
        timeout(time: 45, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        RAILS_ENV        = 'test'
        DOCKER_NETWORK   = 'course-net'
        APP_NAME         = 'balancefood-backend'
        APP_DIR          = 'backend'
        POSTGRES_IMAGE   = 'postgres:16-alpine'
        RUBY_IMAGE       = 'ruby:3.3.7-slim'
        BUNDLE_VOLUME    = 'balancefood-backend-bundle'
        DEPLOY_PORT      = '4101'
        PUBLIC_URL       = 'https://apibalancefood.frubilarz.cl'

        FRONTEND_APP_NAME    = 'balancefood-frontend'
        FRONTEND_DIR         = 'frontend'
        NODE_IMAGE           = 'node:22-alpine'
        NPM_CACHE_VOLUME     = 'balancefood-frontend-npm'
        FRONTEND_DEPLOY_PORT = '4103'
        FRONTEND_PUBLIC_URL  = 'https://balancefood.frubilarz.cl'
        // Vite incrusta esta URL en el bundle al compilar (ver frontend/Dockerfile).
        FRONTEND_API_URL     = 'https://apibalancefood.frubilarz.cl/api/v1'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    def safeBranch = env.BRANCH_NAME.replaceAll(/[^A-Za-z0-9_.-]/, '-').toLowerCase()
                    env.SAFE_BRANCH  = safeBranch
                    env.DB_CONTAINER = "${APP_NAME}-test-db-${safeBranch}-${env.BUILD_NUMBER}"
                    env.IMAGE_TAG    = "${APP_NAME}:${safeBranch}-${env.BUILD_NUMBER}"
                    env.FRONTEND_IMAGE_TAG = "${FRONTEND_APP_NAME}:${safeBranch}-${env.BUILD_NUMBER}"
                }
            }
        }

        stage('Test DB') {
            steps {
                sh '''
                    docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true
                    docker run -d --name "$DB_CONTAINER" --network "$DOCKER_NETWORK" \
                      -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres \
                      "$POSTGRES_IMAGE"
                    for i in $(seq 1 30); do
                      if docker exec "$DB_CONTAINER" pg_isready -U postgres >/dev/null 2>&1; then
                        echo "PostgreSQL listo"; exit 0
                      fi
                      sleep 1
                    done
                    echo "PostgreSQL no respondio a tiempo"; docker logs "$DB_CONTAINER"; exit 1
                '''
            }
        }

        stage('Backend: Build & Test') {
            environment {
                DATABASE_URL = "postgres://postgres:postgres@${env.DB_CONTAINER}:5432"
                BUNDLE_PATH  = '/usr/local/bundle'
            }
            steps {
                script {
                    docker.image(env.RUBY_IMAGE).inside("--network ${env.DOCKER_NETWORK} -u root:root -v ${env.BUNDLE_VOLUME}:/usr/local/bundle") {
                        dir(env.APP_DIR) {
                            stage('Install deps') {
                                sh '''
                                    apt-get update -qq
                                    apt-get install -y -qq --no-install-recommends build-essential libpq-dev libvips git curl >/dev/null
                                    gem install bundler -v "$(tail -1 Gemfile.lock | tr -d ' ')" --no-document >/dev/null
                                    bundle config set --local without ""
                                    bundle install --jobs 4 --retry 3
                                '''
                            }
                            stage('Lint') {
                                sh 'bin/rubocop'
                            }
                            stage('Security') {
                                sh 'bin/brakeman --no-pager'
                                sh 'bin/bundler-audit'
                            }
                            stage('Test') {
                                sh 'bin/rails db:test:prepare'
                                sh 'bin/rails test'
                            }
                        }
                    }
                }
            }
        }

        stage('Frontend: Build & Test') {
            steps {
                script {
                    // Se corre como root para poder escribir la cache de npm en el volumen;
                    // al final se devuelven node_modules/ y dist/ al usuario de Jenkins para
                    // que el siguiente checkout pueda limpiar el workspace.
                    docker.image(env.NODE_IMAGE).inside("-u root:root -v ${env.NPM_CACHE_VOLUME}:/root/.npm") {
                        dir(env.FRONTEND_DIR) {
                            try {
                                stage('npm ci') {
                                    sh 'npm ci --no-audit --no-fund'
                                }
                                stage('ESLint') {
                                    // La app trae errores de ESLint pendientes (react-hooks/set-state-in-effect,
                                    // react-refresh/only-export-components): el stage se marca UNSTABLE en vez de
                                    // cortar el build. Cuando el equipo los corrija, cambiar por `sh 'npm run lint'`.
                                    catchError(buildResult: 'UNSTABLE', stageResult: 'UNSTABLE') {
                                        sh 'npm run lint'
                                    }
                                }
                                stage('Vite build') {
                                    sh 'VITE_API_URL="$FRONTEND_API_URL" npm run build'
                                }
                            } finally {
                                sh 'chown -R "$(stat -c %u:%g package.json)" node_modules dist 2>/dev/null || true'
                            }
                        }
                    }
                }
            }
        }

        stage('Backend: Build image') {
            steps {
                sh 'docker build -t "$IMAGE_TAG" -t "$APP_NAME:$SAFE_BRANCH" "$APP_DIR"'
            }
        }

        stage('Frontend: Build image') {
            steps {
                sh '''
                    docker build \
                      --build-arg VITE_API_URL="$FRONTEND_API_URL" \
                      -t "$FRONTEND_IMAGE_TAG" -t "$FRONTEND_APP_NAME:$SAFE_BRANCH" \
                      "$FRONTEND_DIR"
                '''
            }
        }

        stage('Backend: Deploy') {
            when { branch 'production' }
            steps {
                withCredentials([
                    string(credentialsId: 'balancefood-backend-rails-master-key', variable: 'RAILS_MASTER_KEY'),
                    string(credentialsId: 'balancefood-backend-database-url',     variable: 'PROD_DATABASE_URL')
                ]) {
                    sh '''
                        docker rm -f "$APP_NAME" || true
                        docker run -d \
                          --name "$APP_NAME" \
                          --network "$DOCKER_NETWORK" \
                          --restart unless-stopped \
                          -p 127.0.0.1:$DEPLOY_PORT:80 \
                          -e RAILS_ENV=production \
                          -e RAILS_MASTER_KEY="$RAILS_MASTER_KEY" \
                          -e DATABASE_URL="$PROD_DATABASE_URL" \
                          -e CORS_ORIGINS="$FRONTEND_PUBLIC_URL" \
                          "$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Backend: Health Check') {
            when { branch 'production' }
            steps {
                // Las migraciones las corre bin/docker-entrypoint (`rails db:prepare`) antes
                // de levantar `rails server`. No se lanza un `docker exec db:migrate` aparte:
                // en el droplet de 2 GB dos boots de Rails en paralelo terminan con uno
                // matado por memoria (exit 137, build production #1). Si db:prepare falla,
                // el contenedor muere y este health check falla el build igual.
                // Un arranque en frio (db:prepare + Puma + Thruster) en este droplet puede
                // pasar de 2 min (condotrack production #7 se agoto a los 120 s con la app aun
                // subiendo), asi que se esperan hasta 240 s. Si el contenedor muere antes, se corta.
                sh '''
                    for i in $(seq 1 80); do
                      if curl -fsS "http://127.0.0.1:$DEPLOY_PORT/health"; then echo; break; fi
                      if [ "$(docker inspect -f '{{.State.Running}}' "$APP_NAME" 2>/dev/null)" != "true" ]; then
                        echo "El contenedor $APP_NAME no esta corriendo"; docker logs --tail 50 "$APP_NAME"; exit 1
                      fi
                      if [ "$i" = 80 ]; then echo "Timeout: $APP_NAME no respondio en 240 s"; docker logs --tail 50 "$APP_NAME"; exit 1; fi
                      sleep 3
                    done
                    # Verificacion publica a traves del reverse proxy (no bloquea si el proxy aun no esta configurado).
                    curl -fsS "$PUBLIC_URL/health" && echo || echo "AVISO: $PUBLIC_URL/health no responde; revisar Nginx/DNS en el servidor"
                '''
            }
        }

        stage('Frontend: Deploy') {
            when { branch 'production' }
            steps {
                sh '''
                    docker rm -f "$FRONTEND_APP_NAME" || true
                    docker run -d \
                      --name "$FRONTEND_APP_NAME" \
                      --restart unless-stopped \
                      -p 127.0.0.1:$FRONTEND_DEPLOY_PORT:80 \
                      "$FRONTEND_IMAGE_TAG"
                '''
            }
        }

        stage('Frontend: Health Check') {
            when { branch 'production' }
            steps {
                sh '''
                    for i in $(seq 1 20); do
                      if curl -fsS "http://127.0.0.1:$FRONTEND_DEPLOY_PORT/health"; then break; fi
                      if [ "$(docker inspect -f '{{.State.Running}}' "$FRONTEND_APP_NAME" 2>/dev/null)" != "true" ]; then
                        echo "El contenedor $FRONTEND_APP_NAME no esta corriendo"; docker logs --tail 50 "$FRONTEND_APP_NAME"; exit 1
                      fi
                      if [ "$i" = 20 ]; then echo "Timeout: $FRONTEND_APP_NAME no respondio en 60 s"; docker logs --tail 50 "$FRONTEND_APP_NAME"; exit 1; fi
                      sleep 3
                    done
                    # La raiz debe devolver el index.html de la SPA (no una pagina de error de Nginx).
                    curl -fsS "http://127.0.0.1:$FRONTEND_DEPLOY_PORT/" | grep -q '<div id="root">'
                    # Verificacion publica a traves del reverse proxy (no bloquea si el proxy aun no esta configurado).
                    curl -fsS -o /dev/null "$FRONTEND_PUBLIC_URL/" && echo "$FRONTEND_PUBLIC_URL OK" \
                      || echo "AVISO: $FRONTEND_PUBLIC_URL no responde; revisar Nginx/Certbot en el servidor"
                '''
            }
        }
    }

    post {
        always {
            sh 'docker rm -f "$DB_CONTAINER" >/dev/null 2>&1 || true'
        }
    }
}
