module Api
  module V1
    class MenuItemsController < ApplicationController
      before_action :authenticate!, except: [ :index, :show ]
      before_action :set_restaurant, only: [ :index, :create ]
      before_action :set_menu_item, only: [ :update, :destroy ]

      def index
        items = @restaurant.menu_items
        items = items.available if params[:available] == "true"
        items = items.where(price: ..params[:max_price]) if params[:max_price].present?

        render json: items.order(:price).map { |i| menu_item_json(i) }
      end

      def show
        render json: menu_item_json(MenuItem.find(params[:id]))
      end

      def create
        item = @restaurant.menu_items.build(menu_item_params)

        if item.save
          render json: menu_item_json(item), status: :created
        else
          render json: { errors: item.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def update
        if @menu_item.update(menu_item_params)
          render json: menu_item_json(@menu_item)
        else
          render json: { errors: @menu_item.errors.full_messages },
                 status: :unprocessable_entity
        end
      end

      def destroy
        @menu_item.destroy
        head :no_content
      end

      private

      def set_restaurant
        @restaurant = if action_name == "create"
                        current_user.restaurants.find(params[:restaurant_id])
        else
                        Restaurant.find(params[:restaurant_id])
        end
      end

      def set_menu_item
        @menu_item = MenuItem.joins(:restaurant)
                             .where(restaurants: { user_id: current_user.id })
                             .find(params[:id])
      end

      def menu_item_params
        params.require(:menu_item).permit(:name, :description, :price,
                                          :category, :available)
      end

      def menu_item_json(item)
        item.slice(:id, :name, :description, :price, :category, :available)
            .merge(restaurant_id: item.restaurant_id)
      end
    end
  end
end
