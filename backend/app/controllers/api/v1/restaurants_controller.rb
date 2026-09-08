module Api
  module V1
    class RestaurantsController < ApplicationController
      before_action :authenticate!, except: [ :index, :show ]
      before_action :set_restaurant, only: [ :update, :destroy ]

      def index
        restaurants = Restaurant.all
        restaurants = restaurants.where(campus: params[:campus]) if params[:campus].present?
        restaurants = restaurants.where(category: params[:category]) if params[:category].present?

        render json: restaurants.order(:name).map { |r| restaurant_json(r) }
      end

      def show
        restaurant = Restaurant.find(params[:id])
        render json: restaurant_json(restaurant, incluir_menu: true)
      end

      def create
        restaurant = current_user.restaurants.build(restaurant_params)

        if restaurant.save
          render json: restaurant_json(restaurant), status: :created
        else
          render json: { errors: restaurant.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def update
        if @restaurant.update(restaurant_params)
          render json: restaurant_json(@restaurant)
        else
          render json: { errors: @restaurant.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def destroy
        @restaurant.destroy
        head :no_content
      end

      private

      def set_restaurant
        @restaurant = current_user.restaurants.find(params[:id])
      end

      def restaurant_params
        params.require(:restaurant).permit(:name, :address, :campus,
                                           :category, :description)
      end

      def restaurant_json(restaurant, incluir_menu: false)
        datos = restaurant.slice(:id, :name, :address, :campus, :category, :description)
        datos[:user_id] = restaurant.user_id
        datos[:menu_items] = restaurant.menu_items.map { |i| menu_item_json(i) } if incluir_menu
        datos
      end

      def menu_item_json(item)
        item.slice(:id, :name, :description, :price, :category, :available)
      end
    end
  end
end
