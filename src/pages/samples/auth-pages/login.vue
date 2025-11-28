<template>
  <section class="login">
    <div class="container-scroller">
      <div class="container-fluid page-body-wrapper full-page-wrapper">
        <div class="content-wrapper d-flex align-items-center auth">
          <div class="row w-100 flex-grow">
            <div class="col-sm-6 col-md-6 col-lg-5 col-xl-4 mx-auto">
              <div class="auth-form-light text-center p-5">
                <div class="brand-logo">
                  <img src="@/assets/images/logo.png" alt="logo" />
                </div>
                <h4>Satış Takip Programı <sup>®</sup></h4>
                <form class="pt-3">
                  <div class="form-group">
                    <input
                      type="email"
                      v-model="formData.username"
                      class="form-control
                      form-control-lg"
                      id="exampleInputEmail1"
                      placeholder="Kullanıcı Adı">
                  </div>
                  <div class="form-group">
                    <input
                      type="password"
                      v-model="formData.password"
                      class="form-control
                      form-control-lg"
                      id="exampleInputPassword1"
                      placeholder="Şifre">
                  </div>
                  <div class="mt-3">
                    <el-button
                      class="login-button"
                      type="success"
                      size="large"
                      @click="login">Giriş Yap
                    </el-button>
                  </div>
                  <div class="my-2 d-none justify-content-between align-items-center">
                    <div class="form-check">
                      <label class="form-check-label text-muted">
                        <input type="checkbox" class="form-check-input">
                        Keep me signed in
                        <i class="input-helper"></i>
                      </label>
                    </div>
                    <a href="javascript:void(0);" class="auth-link text-black d-none">Forgot password?</a>
                  </div>
                  <div class="text-center mt-4 font-weight-light d-none">
                    Don't have an account? <router-link to="/auth-pages/register" class="text-primary">Create</router-link>
                  </div>
                </form>
              </div>
            </div>
          </div>
      </div>
      <!-- content-wrapper ends -->
      </div>
      <!-- page-body-wrapper ends -->
    </div>
  </section>

</template>

<script>
export default {
  name: 'login',
  data() {
    return {
      formData: {
        username: "mehmetali",
        password: "12345"
      }
    }
  },
  methods: {
    login() {
      const pass = this.formData.password;
      if(pass == "12345") {
        this.$router.push({ name: "dashboard" });
      } else {
        this.$notify.error({
          title: 'Hata',
          message: 'Bilgilerinizi kontrol edin!'
        });
      }
    }
  },
}
</script>
