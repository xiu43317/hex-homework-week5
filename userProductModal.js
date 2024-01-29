export default {
  template: "#userProductModal",
  data() {
    return {
      modal: "",
      qty: 1,
      isLoading: false,
    };
  },
  props: ["product"],
  methods: {
    openModal() {
      this.modal.show();
    },
    closeModal() {
      this.modal.hide();
    },
    updateQty() {
      this.$emit("update", this.product, this.qty);
    },
  },
  mounted() {
    this.modal = new bootstrap.Modal(this.$refs.modal, {
      keyboard: false,
    });
  },
};
