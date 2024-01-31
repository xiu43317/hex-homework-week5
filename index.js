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
        tel: "",
      },
      message: "",
      cart: [],
      products: [],
      tempProduct: {},
      isLoading: true,
      isDiscount: false,
    };
  },
  methods: {
    isPhone(value) {
      const phoneNumber = /^(09)[0-9]{8}$/;
      return phoneNumber.test(value) ? true : "需要正確的電話號碼";
    },
    onSubmit() {
      if (this.cart.carts.length === 0) {
        alert("購物車不得為空");
        return;
      } else {
        //console.log(this.user);
        const userDetail = {
          data: {
            user: this.user,
            message: this.message,
          },
        };
        axios
          .post(`${url}/api/${path}/order`, userDetail)
          .then((res) => {
            //console.log(res);
            alert(res.data.message);
          })
          .catch((err) => {
            //console.log(err);
            let str = "";
            err.data.message.forEach((item) => {
              str += item + "\n\r";
            });
            alert(str);
          });
      }
    },
    getProducts() {
      axios
        .get(`${url}/api/${path}/products/`)
        .then((res) => {
          //console.log(res.data.products);
          this.products = res.data.products;
          for (let i = 0; i < this.products.length; i++) {
            this.products[i].isLoading = false;
            this.products[i].checkLoading = false;
          }
          //console.log(this.products);
          this.isLoading = false;
        })
        .catch((error) => {
          console.dir(error);
          alert(error.data.message);
          this.isLoading = false;
        });
    },
    getCart() {
      axios
        .get(`${url}/api/${path}/cart`)
        .then((res) => {
          this.cart = { ...res.data.data };
          for (let i = 0; i < this.cart.carts.length; i++) {
            this.cart.carts[i].cancelLoading = false;
          }
          //console.log(this.cart);
        })
        .catch((err) => {
          //console.dir(err);
          alert(err.data.message);
        });
    },
    updateCart(item, qty) {
      axios
        .post(`${url}/api/${path}/cart`, {
          data: {
            product_id: item.id,
            qty: qty,
          },
        })
        .then((res) => {
          //console.log(res.data.message);
          this.$refs.userProductModal.isLoading = false;
          this.products.filter((item) => {
            return (item.isLoading = false);
          });
          alert(item.title + res.data.message);
          //console.log(this.products);
          this.$refs.userProductModal.closeModal();
          this.getCart();
        })
        .catch((err) => {
          //console.log(err);
          alert(err.message);
          this.$refs.userProductModal.isLoading = false;
          this.products.filter((item) => {
            return (item.isLoading = false);
          });
        });
    },
    addToCart(product, qty = 0) {
      qty === 0
        ? (product.isLoading = true)
        : (this.$refs.userProductModal.isLoading = true);
      const index = this.cart.carts.findIndex((item) => item.id === product.id);
      // 購物車有這項目
      if (index !== -1 && qty !== 0) {
        this.updateCart(product, qty);
        // 表格上面的項目且購物車裡面有項目
      } else if (index !== -1 && qty === 0) {
        let total_qty = (this.cart[index].qty += 1);
        this.updateCart(product, total_qty);
        // 表格上面的項目且購物車沒有這項目
      } else if (index === -1 && qty === 0) {
        this.updateCart(product, 1);
        // 購物車沒有這項目
      } else {
        this.updateCart(product, qty);
      }
      // setTimeout(() => {
      //   if (index !== -1 && qty !== 0) {
      //     this.$refs.userProductModal.isLoading = false;
      //     this.cart[index].qty += qty;
      //   } else if (index !== -1 && qty === 0) {
      //     product.isLoading = false;
      //     this.cart[index].qty += 1;
      //   } else if (index === -1 && qty === 0) {
      //     product.isLoading = false;
      //     this.cart.push({
      //       id: product.id,
      //       qty: 1,
      //       cancelLoading: false,
      //       carts: { ...product },
      //     });
      //   } else {
      //     this.cart.push({
      //       id: product.id,
      //       qty: qty,
      //       cancelLoading: false,
      //       carts: { ...product },
      //     });
      //     this.$refs.userProductModal.isLoading = false;
      //   }
      //   this.$refs.userProductModal.closeModal();
      // }, 500);
    },
    renewCart(item, qty) {
      axios
        .put(`${url}/api/${path}/cart/${item.id}`, {
          data: {
            product_id: item.product.id,
            qty: qty,
          },
        })
        .then((res) => {
          //console.log(res.data.message);
          alert(res.data.message);
          this.getCart();
        })
        .catch((err) => {
          //console.log(err);
          alert(err.message);
        });
    },
    clearCart() {
      if (this.cart.carts.length === 0) {
        alert("購物車已經是空的");
        return;
      }
      axios
        .delete(`${url}/api/${path}/carts`)
        .then((res) => {
          //console.log(res.data.message);
          alert("全部商品" + res.data.message);
          this.cart = { carts: [] };
        })
        .catch((err) => {
          //console.log(err);
          alert(err.message);
        });
    },
    deleteItem(product) {
      product.cancelLoading = true;
      axios
        .delete(`${url}/api/${path}/cart/${product.id}`)
        .then((res) => {
          //console.log(res.data.message);
          alert(`${product.product.title}${res.data.message}`);
          product.cancelLoading = false;
          this.getCart();
        })
        .catch((err) => {
          //console.dir(err);
          alert(err.message);
          product.cancelLoading = false;
        });
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
  computed: {},
  mounted() {
    this.getProducts();
    this.getCart();
  },
});
app.use(VueLoading.LoadingPlugin);
app.component("userProductModal", userProductModal);
app.component("loading", VueLoading.Component);
app.component("VForm", VeeValidate.Form);
app.component("VField", VeeValidate.Field);
app.component("ErrorMessage", VeeValidate.ErrorMessage);

app.mount("#app");
