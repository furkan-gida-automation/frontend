<template>
    <el-input
      :value="display"
      @input="handleInput"
      @blur="handleBlur"
      @focus="handleFocus"
      clearable
      :disabled="disabled"
    >
      <div v-if="postfix">
        <template slot="append">₺</template>
      </div>
    </el-input>
  </template>
  
  <script>
  export default {
    name: "PriceInput",
    props: {
      value: { type: [Number, String], default: 0 },
      decimals: { type: Number, default: 2 },
      min: { type: Number, default: 0 },
      disabled: { type: Boolean, default: false },
      postfix: { type: Boolean, default: true },
    },
    data() {
      return {
        display: "",
        isFocused: false
      };
    },
    watch: {
      value: {
        immediate: true,
        handler(val) {
          if (!this.isFocused) {
            const num = this.normalizeToNumber(val);
            this.display = this.formatForDisplay(num);
          }
        },
      },
    },
    methods: {
      sanitizeInput(str) {
        if (str == null) return "";
        str = String(str).replace(/[^\d.,]/g, "");
        str = str.replace(/,/g, ".");
        const firstDot = str.indexOf(".");
        if (firstDot !== -1) {
          const head = str.slice(0, firstDot + 1);
          const tail = str.slice(firstDot + 1).replace(/\./g, "");
          str = head + tail;
        }
        const parts = str.split(".");
        if (parts.length === 2) {
          parts[1] = parts[1].slice(0, this.decimals);
          str = parts[0] + "." + parts[1];
        }
        str = str.replace(/^0+(\d)/, "$1");
        return str;
      },
      normalizeToNumber(val) {
        if (val === "" || val == null) return 0;
        if (typeof val === "number") return val;

        let str = String(val).trim();

        // 1.234,56 → 1234.56
        // 1,234.56 → 1234.56
        const commaIndex = str.lastIndexOf(",");
        const dotIndex = str.lastIndexOf(".");

        if (commaIndex > dotIndex) {
          str = str.replace(/\./g, "").replace(",", ".");
        } else {
          str = str.replace(/,/g, "");
        }

        const num = parseFloat(str);
        return isNaN(num) ? 0 : num;
      },
      clamp(n) {
        if (n < this.min) return this.min;
        return n;
      },
      handleInput(raw) {
        const cleaned = this.sanitizeInput(raw);
        const num = this.clamp(Number(cleaned || 0));
        this.$emit("input", Number(num.toFixed(this.decimals)));
        this.display = cleaned;
      },
      handleFocus() {
        this.isFocused = true;
        const num = this.normalizeToNumber(this.value);
        this.display = num ? String(num.toFixed(this.decimals)).replace(/\.?0+$/, (m)=> m.startsWith('.')?'.'+m.slice(1):'') : "";
      },
      handleBlur() {
        this.isFocused = false;
        const num = this.normalizeToNumber(this.display);
        const clamped = this.clamp(num);
        this.$emit("input", Number(clamped.toFixed(this.decimals)));
        
        this.$emit("blur");
        this.$emit("change", Number(clamped.toFixed(this.decimals)));
        this.display = this.formatForDisplay(clamped);
      },
      formatForDisplay(n) {
        const num = Number(isNaN(n) ? 0 : n);
        return new Intl.NumberFormat("tr-TR", {
          minimumFractionDigits: this.decimals,
          maximumFractionDigits: this.decimals,
        }).format(num);
      },
    },
  };
  </script>
  