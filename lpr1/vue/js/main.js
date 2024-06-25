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
    methods: {
        onSubmit() {
            if (this.name && this.review && this.rating && this.recommend) {
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
                if (!this.name) this.errors.push("Name required.")
                if (!this.review) this.errors.push("Review required.")
                if (!this.rating) this.errors.push("Rating required.")
                if (!this.recommend) this.errors.push("Recommend required.")
            }
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        },
        premium: {
            type: Boolean,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        sizes: {
            type: Array,
            required: true
        },
        link: {
            type: String,
            required: true
        },
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
            <button v-if="reviews.length > 2" @click="toggleSortOrder">{{ sortOrderText }}</button>
            <ul>
                <li v-for="review in sortedReviews" :key="review.name + review.review">
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
            <product-shipping :premium="premium"></product-shipping>
        </div>
        <div v-show="selectedTab === 'Details'">
            <product-detail :details="details" :sizes="sizes" :link="link" :description="description"></product-detail>
        </div>
     </div>

 `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review', 'Shipping', 'Details'],
            selectedTab: 'Reviews',
            sortOrder: 'desc'
        }
    },
    computed: {
        sortedReviews() {
            return this.reviews.slice().sort((a, b) => {
                if (this.sortOrder === 'desc') {
                    return b.rating - a.rating;
                } else {
                    return a.rating - b.rating;
                }
            });
        },
        sortOrderText() {
            return this.sortOrder === 'desc' ? 'Сначала хорошие' : 'Сначала плохие';
        }
    },
    methods: {
        toggleSortOrder() {
            this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        }
    }
})

Vue.component('product-shipping', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
    <p>Shipping: {{ shipping }}</p>
    `,
    computed: {
        shipping() {
            return this.premium ? "Free" : 2.99;
        }
    }
})

Vue.component('product-detail', {
    props: {
        description: {
            type: String,
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        sizes: {
            type: Array,
            required: true
        },
        link: {
            type: String,
            required: true
        },
    },
    template: `
        <div>
            <p>{{ description }}</p>
            <p>Details:</p>
            <ul>
                <li v-for="detail in details">{{ detail }}</li>
            </ul>
            <p>Sizes:</p>
            <ul>
                <li v-for="size in sizes">{{ size }}</li>
            </ul>
            <div class="product-link">
                <a :href="link">More product like this</a>
            </div>
        </div>
    `
})


Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
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
            <div
                class="color-box"
                v-for="(variant, index) in variants"
                :key="variant.variantId"
                :style="{ backgroundColor:variant.variantColor }"
                @mouseover="updateProduct(index)"
            ></div>
            <p>Rating: {{ averageRating }}</p>
            <div class="buttons">
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
        </div>           
        <product-tabs :reviews="reviews" :details="details" :sizes="sizes" :link="link" :description="description" :premium="premium"></product-tabs>
    </div>
    
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
            reviews: [],
            link: "https://www.amazon.com/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=socks",
            description: "A pair of warm, fuzzy socks",
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            sizes: ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'],
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
        delFromCart() {
            this.$emit('del-from-cart',
                this.variants[this.selectedVariant].variantId);
        },
        updateProduct(index) {
            this.selectedVariant = index;
        }
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
        sale() {
            if (this.variants[this.selectedVariant].variantOnSale == 1) {
                return this.brand + ' ' + this.product + ' now on sale!!!';
            } else {
                return this.brand + ' ' + this.product + ' no sale :(';
            }
        },
        averageRating() {
            if (this.reviews.length === 0) return 'No ratings yet';
            let sum = this.reviews.reduce((sum, review) => sum + review.rating, 0);
            return (sum / this.reviews.length).toFixed(1); // Round to one decimal place
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
        deleteFromCart(id) {
            this.cart.pop(id);
        }
    }
})
