<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div>
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-account-multiple"></i>
          </span>
          Tüm Müşteriler ({{filteredData.length}})
        </div>
        <el-button type="success" size="medium" icon="el-icon-circle-plus" @click="isOpenDialog('add')">Müşteri Oluştur</el-button>
      </h3>
      <!-- liste gruplar halinde gösteribilir group by gibi -->
    </div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <div class="col-3 col-sm-4 col-md-2 mb-3">
            <el-input
              v-model="filter.search"
              placeholder="Müşteri arayın"
              clearable
              prefix-icon="el-icon-search"
            />
          </div>
          <div class="col-3 col-sm-4 mb-3 pl-0">
            <el-select
              v-model="filter.group"
              filterable
              clearable
              placeholder="Grup seçin"
              @change="currentPage = 1"
            >
              <el-option
                v-for="item in getGroupList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 grid-margin">
            <el-table
              :data="paginatedData"
              border
              style="width: 100%"
              show-summary
              :summary-method="getSummaries"
              empty-text="Müşteri bulunamadı"
            >
              <!-- <el-table-column prop="id" label="ID" width="180"></el-table-column> -->
              <el-table-column prop="companyName" label="Firma Adı" width="180">
                <template v-slot="scope">{{ scope.row.companyName }}</template>
              </el-table-column>
              <el-table-column prop="name" label="Firma Yetkilisi">
                <template v-slot="scope">
                  {{ scope.row.name }} {{ scope.row.surname }}
                </template>
              </el-table-column>
              <el-table-column prop="phone" label="Telefon" width="115"></el-table-column>
              <el-table-column prop="address" label="Adres"></el-table-column>
              <el-table-column prop="createdDate" label="Oluşturulma Zamanı" width="150">
                <template v-slot="scope">
                  <center>{{ scope.row.createdDate | formatDate }}</center>
                </template>
              </el-table-column>
              <el-table-column prop="group" label="Rota Grubu" sortable>
                <template v-slot="scope">
                  {{ getGroupNameList(scope.row.group) }}
                </template>
              </el-table-column>
              <el-table-column prop="debt" label="Güncel Borç" sortable>
                <template v-slot="scope">
                  {{ scope.row.debt | formatNumber }}
                </template>
              </el-table-column>
              <el-table-column prop="note" label="Not">
                <template v-slot="scope">
                  <el-tooltip class="item" effect="dark" :content="scope.row.note ? scope.row.note : 'Henüz not belirtilmedi'" placement="left">
                    <div class="cursor gap-5">
                      <i class="el-icon-info"></i>
                      <span>Bilgi</span>
                    </div>
                  </el-tooltip>
                </template>
              </el-table-column>
              <el-table-column fixed="right" label="İşlem" width="225">
                <template v-slot="scope">
                  <div class="process">
                    <el-button v-if="scope.row.isProcess" type="success" size="small" icon="el-icon-notebook-2" @click="handleClick(scope.row.id)">İşlemleri Gör</el-button>
                    <el-button type="primary" size="small" icon="el-icon-edit" circle @click="isOpenDialog('edit', scope.row)"></el-button>
                    <el-button type="danger" size="small" icon="el-icon-delete" circle @click="openDeletePopup(scope.row)" :disabled="scope.row.totalOutputWeight > 0"></el-button>
                  </div>
                </template>
              </el-table-column>
            </el-table>

            <el-pagination
              background
              layout="prev, pager, next"
              :total="filteredData.length"
              :page-size="pageSize"
              :current-page="currentPage"
              @current-change="handlePageChange"
              style="margin-top: 20px; text-align: center"
            />
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      :title="getPopupTitle"
      :visible.sync="dialogVisible"
      width="37%"
      @close="closePopup"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Firma Adı">
              <el-input v-model="formData.companyName" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Yetkili Adı Soyadı">
              <el-input v-model="formData.name" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Telefon">
              <el-input v-model="formData.phone" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Adres">
              <el-input v-model="formData.address" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item class="mb-0" label="Rota Grubu Seçin">
              <el-select
                class="w-full"
                v-model="formData.group"
                filterable
                clearable
                placeholder="Grup adı ile ara"
              >
                <el-option
                  v-for="item in getGroupList"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Not" prop="note">
              <el-input
                type="textarea"
                class="no-resize-textarea"
                v-model="formData.note"
                :autosize="false"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Vazgeç</el-button>
        <el-button type="primary" @click="saveChanges">Kaydet</el-button>
      </span>
    </el-dialog>

    <el-dialog
      title="Müşteri Silme İşlemi"
      :visible.sync="deleteCustomerPopupStatus"
      width="25%"
      @close="closeDeletePopup"
    >
      <p><b>{{ currentCustomer.companyName }}</b> adlı müşterinizi silmek istediğinizden emin misiniz?</p>
      <p><b>Not :</b> Geçmiş tüm işlemleri de silinecektir.</p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="deleteCustomerPopupStatus = false">Vazgeç</el-button>
        <el-button type="danger" @click="deleteCustomer">Evet, Sil</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import customers from "@/mock/customers.json";
import globalMixin from '@/mixins/global.mixin.js';
import { formatNumber } from '@/util/helpers';

export default {
  name: "Customers",
  mixins: [globalMixin],
  data() {
    return {
      isEdit: false,
      pageSize: 10,
      currentPage: 1,
      dialogVisible: false,
      deleteCustomerPopupStatus: false,
      currentCustomer: {},
      customerDetail: {},
      formData: {
        name: "",
        companyName: "",
        phone: "",
        address: "",
        group: "",
        note: ""
      },
      filter: {
        search: "",
        group: ""
      },
    }
  },
  computed: {
    getCustomerList() {
      return customers;
    },
    getPopupTitle() {
      return this.isEdit ? "Müşteri Bilgilerini Düzenle" : "Yeni Müşteri Oluştur"
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData?.slice(start, end);
    },
    filteredData() {
      let list = this.getCustomerList || [];

      if (this.filter.search) {
        const search = this.filter.search.toLowerCase();
        list = list.filter(item =>
          `${item.name} ${item.surname}`.toLowerCase().includes(search)
        );
      }

      if (this.filter.group) {
        list = list.filter(item => String(item.group) === String(this.filter.group));
      }

      return list;
    }
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
    },
    isOpenDialog(type, row = {}) {
      this.isEdit = type === 'edit';
      this.customerDetail = row;
      
      if (this.isEdit) {
        this.fillForm(row);
      } else {
        this.resetFormData();
      }
      this.formData.companyName = row.companyName || '';
      this.dialogVisible = true;
    },
    saveChanges() {
      if (this.isEdit) {
        this.$notify.success({
          title: 'Başarılı',
          message: 'Müşteri Bilgileri Güncellendi'
        });
      } else {
        this.$notify.success({
          title: 'Başarılı',
          message: 'Müşteri Oluşturuldu'
        });
      }
      this.closePopup();
    },
    deleteCustomer() {
      if (this.currentCustomer) {
        this.$notify.success({
          title: 'Başarılı',
          message: 'Müşteri Silindi'
        });
        this.closeDeletePopup();
      }
    },
    closePopup() {
      this.dialogVisible = false;
    },
    closeDeletePopup() {
      this.deleteCustomerPopupStatus = false;
    },
    openDeletePopup(row) {
      this.currentCustomer.id = row.name;
      this.currentCustomer.companyName = row.companyName;
      this.deleteCustomerPopupStatus = true;
    },
    fillForm(row) {
      this.formData = {
        ...this.formData,
        ...row,
      };
    },
    resetFormData() {

    },
    handleClick(id) {
      this.$router.push({ name: 'transactions', query: { q: id } });
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      
      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Toplam';
          return;
        }
        const isDebtColumn =
          column?.property &&
          column.property.toLowerCase().includes('debt');

          if (isDebtColumn) {
            const values = this.filteredData?.map(item => Number(item[column.property]));
            const total = values?.reduce((prev, curr) => {
              const value = Number(curr);
              return !isNaN(value) ? prev + value : prev;
            }, 0);

            sums[index] = formatNumber(total) + ' ₺';
          } else {
            sums[index] = '';
          }
      });

      return sums;
    },
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .w-full {
    width: 100%;
  }
  .el-table__row {
    .cell {
      .process {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
    }
  }
}
</style>