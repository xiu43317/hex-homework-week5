VeeValidate.defineRule("email", VeeValidateRules["email"]);
VeeValidate.defineRule("required", VeeValidateRules["required"]);

// 讀取外部的資源
VeeValidateI18n.loadLocaleFromURL("./zh_TW.json");

// Activate the locale
VeeValidate.configure({
  generateMessage: VeeValidateI18n.localize("zh_TW"),
  validateOnInput: true, // 調整為：輸入文字時，就立即進行驗證
});

const url = "https://vue3-course-api.hexschool.io/v2"; // 請加入站點
const path = "rock"; // 請加入個人 API Path
import userProductModal from "./userProductModal.js";
const app = Vue.createApp({
  data() {
    return {
      user: {
        email: "",
        name: "",
        address: "",
        phone: "",
      },
      cart: [],
      products: [],
      tempProduct: {},
      isLoading: true,
    };
  },
  methods: {
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
    onSubmit() {
      //console.log(this.user);
    },
    getProducts() {
      axios
        .get(`${url}/api/${path}/products/all`)
        .then((res) => {
          //console.log(res.data.products);
          this.products = { ...res.data.products };
          for (let i = 0; i < this.products.length; i++) {
            this.products[i].isLoading = false;
            this.product[i].checkLoading = false;
          }
          //console.log(this.products);
          this.isLoading = false;
        })
        .catch((error) => {
          console.dir(error);
          this.isLoading = false;
        });
    },
    addToCart(product, qty = 0) {
      qty === 0
        ? (product.isLoading = true)
        : (this.$refs.userProductModal.isLoading = true);
      const index = this.cart.findIndex((item) => item.id === product.id);
      setTimeout(() => {
        if (index !== -1 && qty !== 0) {
          this.$refs.userProductModal.isLoading = false;
          this.cart[index].qty += qty;
        } else if (index !== -1 && qty === 0) {
          product.isLoading = false;
          this.cart[index].qty += 1;
        } else if (index === -1 && qty === 0) {
          product.isLoading = false;
          this.cart.push({
            id: product.id,
            qty: 1,
            cancelLoading: false,
            carts: { ...product },
          });
        } else {
          this.cart.push({
            id: product.id,
            qty: qty,
            cancelLoading: false,
            carts: { ...product },
          });
          this.$refs.userProductModal.isLoading = false;
        }
        this.$refs.userProductModal.closeModal();
      }, 500);
    },
    clearCart() {
      this.cart = [];
    },
    deleteItem(product) {
      product.cancelLoading = true;
      setTimeout(() => {
        const index = this.cart.findIndex((item) => item.id === product.id);
        this.cart.splice(index, 1);
        product.cancelLoading = false;
      }, 500);
    },
    openModal(item) {
      this.tempProduct = item;
      item.checkLoading = true;
      setTimeout(() => {
        this.$refs.userProductModal.openModal();
        item.checkLoading = false;
      }, 500);
    },
  },
  computed: {
    origin_sum() {
      let total = 0;
      this.cart.forEach((item) => {
        total += item.carts.origin_price * item.qty;
      });
      return total;
    },
    discount_sum() {
      let total = 0;
      this.cart.forEach((item) => {
        total += item.carts.price * item.qty;
      });
      return total;
    },
  },
  mounted() {
    this.getProducts();
  },
});
app.use(VueLoading.LoadingPlugin);
app.component("userProductModal", userProductModal);
app.component("loading", VueLoading.Component);
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
