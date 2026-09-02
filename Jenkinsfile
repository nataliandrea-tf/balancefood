// CI/CD de BalanceFood para jenkins.frubilarz.cl.
//
// Monorepo: backend/ (Rails 8 API + PostgreSQL), frontend/ (React) y mobile/ (Flutter).
// Por ahora el pipeline cubre solo backend/; frontend y mobile se agregan como
// stages adicionales (idealmente con `when { changeset "frontend/**" }`).
//
// El servidor Jenkins tiene un solo executor y Docker disponible. Las etapas de CI
// corren dentro de contenedores efimeros conectados a la red Docker externa
// `course-net`; la base de datos de test es un PostgreSQL levantado por build y
// destruido al terminar.
//
// Flujo backend:
//   Checkout -> Test DB -> Install deps -> Lint -> Security -> Test -> Build image
//   (solo rama `production`) -> Deploy -> Migrate -> Health Check
//
// Produccion: el contenedor se publica en 127.0.0.1:4101 y el reverse proxy del
// servidor (Nginx) expone https://apibalancefood.frubilarz.cl hacia ese puerto.
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

        stage('Backend: Build image') {
            steps {
                sh 'docker build -t "$IMAGE_TAG" -t "$APP_NAME:$SAFE_BRANCH" "$APP_DIR"'
            }
        }

        stage('Deploy') {
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
                          "$IMAGE_TAG"
                    '''
                }
            }
        }

        stage('Migrate') {
            when { branch 'production' }
            steps {
                // bin/docker-entrypoint ya corre db:prepare al arrancar `rails server`;
                // esto lo reejecuta de forma explicita y falla el build si la migracion falla.
                sh 'docker exec "$APP_NAME" bin/rails db:migrate'
            }
        }

        stage('Health Check') {
            when { branch 'production' }
            steps {
                sh '''
                    for i in $(seq 1 20); do
                      if curl -fsS "http://127.0.0.1:$DEPLOY_PORT/health"; then echo; break; fi
                      if [ "$i" = 20 ]; then docker logs --tail 50 "$APP_NAME"; exit 1; fi
                      sleep 3
                    done
                    # Verificacion publica a traves del reverse proxy (no bloquea si el proxy aun no esta configurado).
                    curl -fsS "$PUBLIC_URL/health" && echo || echo "AVISO: $PUBLIC_URL/health no responde; revisar Nginx/DNS en el servidor"
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
