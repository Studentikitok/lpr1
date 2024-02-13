let eventBus = new Vue()

Vue.component('product-review', {
    template: `

<form class="review-form" @submit.prevent="onSubmit">

<p v-if="errors.length">
 <b>Please correct the following error(s):</b>
 <ul>
   <li v-for="error in errors">{{ error }}</li>
 </ul>
</p>

 <p>
   <label for="name">Name:</label>
   <input id="name" v-model="name" placeholder="name">
 </p>

 <p>
   <label for="review">Review:</label>
   <textarea id="review" v-model="review"></textarea>
 </p>

 <p>
   <label for="rating">Rating:</label>
   <select id="rating" v-model.number="rating">
     <option>5</option>
     <option>4</option>
     <option>3</option>
     <option>2</option>
     <option>1</option>
   </select>
 </p>
 
 <p>
    <p>Would you recommend this product?</p>
    <input type="radio" value="Yes" v-model="recommend">
    <label>Yes</label>
    <br>
    <input type="radio" value="No" v-model="recommend">
    <label>No</label>
</p>

 <p>
   <input type="submit" value="Submit"> 
 </p>

</form>
 `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods:{
        onSubmit() {
            if(this.name && this.review && this.rating && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend
                }
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null
                this.recommend = null
            } else {
                if(!this.name) this.errors.push("Name required.")
                if(!this.review) this.errors.push("Review required.")
                if(!this.rating) this.errors.push("Rating required.")
                if(!this.recommend) this.errors.push("Recommend required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: false
        },
        premium: {
            type: Boolean,
            required: true
        }
    },

    template: `
    <div>   
       <ul>
         <span class="tab"
               :class="{ activeTab: selectedTab === tab }"
               v-for="(tab, index) in tabs"
               @click="selectedTab = tab"
         >{{ tab }}</span>
       </ul>
       <div v-show="selectedTab === 'Reviews'">
         <p v-if="!reviews.length">There are no reviews yet.</p>
         <ul>
           <li v-for="review in reviews">
           <p>{{ review.name }}</p>
           <p>Rating: {{ review.rating }}</p>
           <p>{{ review.review }}</p>
           <p>Recommend? {{ review.recommend }}</p>
           </li>
         </ul>
        </div>
        <div v-show="selectedTab === 'Make a Review'">
            <product-review></product-review>       
        </div>
        <div v-show="selectedTab === 'Shipping'">
            <product-shipping></product-shipping>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-detail></product-detail>
            <product-detail :details="details" :sizes="sizes"></product-detail>
        </div>
     </div>

 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',  // устанавливается с помощью @click
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
            shipping() {
            if (this.premium) {
                return "Free";
            } else {
                return 2.99
                }
            }
        }
    }
})

Vue.component('product-shipping', {
    props:{
        premium: {
            type: Boolean,
            required: true
        }
    },
    template:`
    <p>Shipping: {{ shipping }}</p>
    `,
    data(){
        return{
            shipping() {
                if (this.premium) {
                    return "Free";
                } else {
                    return 2.99
                }
            }
        }
    }
})

Vue.component('product-detail', {
    props:{
        details:{
            type: Array,
            required: true
        },
        sizes:{
            type: Array,
            required: true
        }
    },
    template:`
        <ul>
            <li v-for="detail in details">{{ detail }}</li>
            <li v-for="size in sizes">{{ size }}</li>
        </ul>
    `
})


Vue.component('product', {
    template: `
   <div class="product">
    <div class="product-image">
           <img :src="image" :alt="altText"/>
       </div>

       <div class="product-info">
           <h1>{{ title }}</h1>
           <p v-if="inStock">In stock</p>
           <p v-else class="disabledText">Out of Stock</p>
           <p>{{ sale }}</p>
           <ul>
               <li v-for="detail in details">{{ detail }}</li>
           </ul>
           <div
                   class="color-box"
                   v-for="(variant, index) in variants"
                   :key="variant.variantId"
                   :style="{ backgroundColor:variant.variantColor }"
                   @mouseover="updateProduct(index)"
           ></div>
          
           <button
                   v-on:click="addToCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
               Add to cart
           </button>
           <button v-on:click="delFromCart"
                   :disabled="!inStock"
                   :class="{ disabledButton: !inStock }"
           >
           Delete from cart
           </button>    
       </div>           
       <product-tabs :reviews="reviews"></product-tabs>
       
 `,
    data() {
        return {
            product: "Socks",
            brand: 'Vue Mastery',
            selectedVariant: 0,
            altText: "A pair of socks",
            variants: [
                {
                    variantId: 2234,
                    variantColor: 'green',
                    variantImage: "./assets/vmSocks-green-onWhite.jpg",
                    variantQuantity: 10,
                    variantOnSale: 1
                },
                {
                    variantId: 2235,
                    variantColor: 'blue',
                    variantImage: "./assets/vmSocks-blue-onWhite.jpg",
                    variantQuantity: 0,
                    variantOnSale: 0
                }
            ],
            reviews: []
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    },

    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId);
        },
        delFromCart(){
            this.$emit('del-from-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
            console.log(index);
        },
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product;
        },
        image() {
            return this.variants[this.selectedVariant].variantImage;
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale(){
            if(this.variants[this.selectedVariant].variantOnSale == 1){
                return this.brand + ' ' + this.product + ' now on sale!!!';
            } else {
                return this.brand + ' ' + this.product + ' no sale :(';
            }
        }
    }
})
let app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id);
        },
        deleteFromCart(id){
            this.cart.pop(id);
        }
    }
})
