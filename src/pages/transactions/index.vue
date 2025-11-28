<template>
  <div>
    <div class="page-header">
      <h3 class="page-title">
        <div class="page-header__summary">
          <span class="page-title-icon bg-gradient-success text-white mr-2">
            <i class="mdi mdi-file-document menu-icon"></i>
          </span>
          <div class="page-header__summary-item">
            <span>Tahsilat Hareketleri ({{filteredData.length}})</span>
            <span class="font-weight-bold">{{ getCurrentCompany }}</span>
          </div>
        </div>
        <div>
          <el-button v-if="getCurrentCompany" type="success" size="medium" icon="el-icon-circle-plus" @click="isOpenDialog('add')">Yeni Satış</el-button>
          <el-button type="success" size="medium" icon="el-icon-location-outline" @click="openCreateRouteDialog">Rota Oluştur</el-button>
        </div>
      </h3>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="row">
          <!-- filter start -->
          <div class="col-3 col-sm-4 col-md-2 mb-3">
            <el-input
              v-model="filter.search"
              placeholder="Müşteri, Firma arayın"
              clearable
              prefix-icon="el-icon-search"
            />
          </div>
          <div v-if="!currentCustomerId" class="col-2 col-sm-4 col-md-2 mb-3 pl-0">
            <el-select
              class="w-full"
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
          <div class="col-2 col-sm-4 col-md-3 mb-3 pl-0">
            <el-date-picker
              class="w-full"
              v-model="filter.transactionDate"
              type="daterange"
              range-separator="-"
              start-placeholder="İşlem Başlangıç"
              end-placeholder="İşlem Bitiş"
              format="dd/MM/yyyy"
              placeholder=""
              @change="currentPage = 1"
              :disabled="filter.collectionDate"
            >
            </el-date-picker>
          </div>
          <div class="col-2 col-sm-4 col-md-3 mb-3 pl-0">
            <el-date-picker
              class="w-full"
              v-model="filter.collectionDate"
              type="daterange"
              range-separator="-"
              start-placeholder="Tahsilat Başlangıç"
              end-placeholder="Tahsilat Bitiş"
              format="dd/MM/yyyy"
              @change="currentPage = 1"
              :disabled="filter.transactionDate"
            >
            </el-date-picker>
          </div>
          <!-- filter end -->

          <!-- listeki işlemin en günceli her zaman gösterilir -->
          <div class="col-12 grid-margin">
            <el-table
              ref="mainTable"
              :data="paginatedData"
              border
              style="width: 100%"
              show-summary
              :summary-method="getSummaries"
              empty-text="Tahsilat Hareketi bulunamadı"
            >
              <!-- @expand-change="onExpand" -->
            <!-- size="mini" -->
            <!-- :data=""scope.row.previousTransactions || [] -->
              <el-table-column type="expand">
                <template v-slot="scope">
                  <div class="transaction-detail" :class="{'revise': getCurrentCompany}"> <!-- :class="{'revise': getCurrentCompany}" -->
                    <el-table
                      border
                      :data="[
                        ...(scope.row.previousTransactions || []),
                        ...(tempTransactionId === scope.row.id && tempRows ? [tempRows[scope.row.id]] : [])
                      ]"
                      empty-text="Geçmiş işlem bulunamadı"
                    >
                      <!-- <el-table-column prop="createdDate" label="İşlem Tarihi" width="145">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row">
                            <el-input type="date" v-model="tempRows[scope2.row.parentId].createdDate" />
                          </div>
                          <div v-else>
                            {{ scope2.row.createdDate | formatDate }}
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="sellAmount" label="Satış Tutarı" width="130">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row">
                            <price-input v-model="tempRows[scope2.row.parentId].sellAmount" :postfix="false" :decimals="2" :min="0" />
                           </div>
                           <div v-else>
                             {{ scope2.row.sellAmount | formatNumber }}
                           </div>
                        </template>
                      </el-table-column> -->
                      <el-table-column prop="collectionDate" label="Tahsilat Tarihi" width="145">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row">
                            <el-input type="date" v-model="tempRows[scope2.row.parentId].collectionDate" />
                          </div>
                          <div v-else>
                            {{ scope2.row.collectionDate | formatDate }}
                          </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="collectionAmount" label="Tahsilat Tutarı" width="137">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row">
                            <price-input v-model="tempRows[scope2.row.parentId].collectionAmount" :postfix="false" :decimals="2" :min="0" />
                           </div>
                           <div v-else>
                             {{ scope2.row.collectionAmount | formatNumber }}
                           </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="remaining" label="Kalan Borç" width="115">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row">
                            <div v-if="calcTotalDebt(scope2)">
                              {{ calcTotalDebt(scope2) | formatNumber }}
                            </div>
                            <label v-else class="badge badge-gradient-success">Ödendi</label>
                           </div>
                           <div v-else>
                             {{ scope2.row.remaining | formatNumber }}
                           </div>
                        </template>
                      </el-table-column>
                      <el-table-column prop="outstandingDebt" label="Devreden Borç" width="140" sortable>
                        <template><div></div></template>
                      </el-table-column>
                      <el-table-column prop="note" label="Not" width="87"><template><div></div></template></el-table-column>
                      <!-- <el-table-column prop="note" label="Not" width="87">
                        <template v-slot="scope">
                          <el-tooltip class="item" effect="dark" :content="scope.row.note ? scope.row.note : 'Henüz not belirtilmedi'" placement="left">
                            <div class="cursor gap-5">
                              <i class="el-icon-info"></i>
                              <span>Bilgi</span>
                            </div>
                          </el-tooltip>
                        </template>
                      </el-table-column> -->
                      <el-table-column fixed="right" width="210">
                        <template v-slot="scope2">
                          <div v-if="tempRows[scope2.row.parentId] === scope2.row" class="d-flex align-items-center justify-content-end" style="padding-right: 7px">
                            <el-button
                              type="success"
                              size="small"
                              icon="el-icon-check"
                              circle
                              @click="saveNewProcess(scope.row)" 
                              :disabled="(!tempRows[scope2.row.parentId].collectionAmount || calcTotalDebt(scope2) < 0)">
                            </el-button>
                            <el-button
                              type="danger"
                              size="small"
                              icon="el-icon-close"
                              circle
                              @click="cancelProcess(scope.row)"></el-button>
                           </div>
                          <div v-else class="d-flex align-items-center justify-content-end" style="padding-right: 7px">
                            <!-- <el-button type="primary" size="small" icon="el-icon-edit" circle
                              @click="isOpenDialog('edit', scope.row, true)"></el-button> -->
                            <el-button type="danger" size="small" icon="el-icon-delete" circle
                              @click="open(scope.row)" :disabled="scope.row.totalOutputWeight > 0"></el-button>
                          </div>
                        </template>
                      </el-table-column>
                    </el-table>
                  </div>
                </template>
              </el-table-column>

              <el-table-column v-if="!currentCustomerId" prop="companyName" label="Firma Adı" width="180">
                <template v-slot="scope">{{ scope.row.companyName }}</template>
              </el-table-column>

              <el-table-column prop="fullName" label="Yetkili" width="160">
                <template v-slot="scope">{{ scope.row.fullName }}</template>
              </el-table-column>

              <el-table-column prop="createdDate" label="İşlem Tarihi" width="145">
                <template v-slot="scope">
                  {{ scope.row.transactionDate | formatDate }}
                </template>
              </el-table-column>

              <el-table-column prop="sellAmount" label="Satış Tutarı" width="130" sortable>
                <template v-slot="scope">
                  {{ scope.row.sellAmount | formatNumber }}
                </template>
              </el-table-column>

              <el-table-column prop="collectionDate" label="Tahsilat Tarihi" width="145">
                <template v-slot="scope">
                  {{ scope.row.collectionDate | formatDate }}
                </template>
              </el-table-column>

              <el-table-column prop="collectionAmount" label="Tahsilat Tutarı" width="137" sortable>
                <template v-slot="scope">
                  {{ scope.row.collectionAmount | formatNumber }}
                </template>
              </el-table-column>

              <el-table-column prop="remaining" label="Kalan Borç" sortable width="115">
                <template v-slot="scope">
                  {{ scope.row.remaining | formatNumber }}
                </template>
              </el-table-column>
              
              <el-table-column prop="outstandingDebt" label="Devreden Borç" width="140" sortable>
                <template v-slot="scope">
                  <label v-if="scope.row.outstandingDebt" class="badge badge-gradient-danger">
                    {{ scope.row.outstandingDebt | formatNumber }}
                  </label>
                  <div v-else>
                    {{ scope.row.outstandingDebt | formatNumber }}
                  </div>
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

              <el-table-column fixed="right" label="İşlem" width="220">
                <template v-slot="scope">
                  <el-button type="success" size="small" icon="el-icon-circle-plus"
                    @click="addNewRow(scope.row)" :disabled="(scope.row.id === tempTransactionId) || (scope.row.remaining === 0 && scope.row.outstandingDebt === 0)">Yeni İşlem</el-button> <!-- isOpenDialog('add', scope.row) - addNewRow(scope.row.id) -->
                  <el-button type="primary" size="small" icon="el-icon-edit" circle
                    @click="isOpenDialog('edit', scope.row)"></el-button>
                  <el-button type="danger" size="small" icon="el-icon-delete" circle
                    @click="open(scope.row)" :disabled="scope.row.totalOutputWeight > 0"></el-button>
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
      title="Rota oluştur"
      :visible.sync="createRouteDialog"
      width="45%"
      @close="closeRouteDialog"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item class="mb-0" label="Grup Seçin">
              <el-select
                class="w-full"
                v-model="filter.groupForRoute"
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
          <el-col :span="9">
            <el-form-item class="mb-0" label="Rota Tipi">
              <el-radio-group v-model="filter.visitType" size="small">
                <el-radio :label="1">Tahsilat</el-radio>
                <el-radio label="Tümü">Tümü</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <!-- <el-col :span="8">
            <el-form-item class="mb-0" label="Devredenler Dahil Edilsin Mi?">
              <el-radio-group v-model="filter.isOutstandingDebt" size="small">
                <el-radio :label="1">Evet</el-radio>
                <el-radio :label="0">Hayır</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col> -->
        </el-row>
      </el-form>

      <hr>

      <el-row :gutter="16">
        <el-col :span="13">
          <el-alert
            v-if="filter.groupForRoute"
            title="Seçilen gruba ait müşterilerin rotası, aşağıdaki gibidir."
            type="info"
            :closable="false"
            show-icon
            class="mb-4">
          </el-alert>
        </el-col>
      </el-row>
      
      <el-table
        :data="getRouteList"
        border
        style="width: 100%"
        show-summary
        :summary-method="getSummariesRoute"
        empty-text="Rota için müşteri bulunamadı!">
        <el-table-column prop="companyName" label="Firma" width="180">
        </el-table-column>
        <el-table-column prop="transactionDate" label="İşlem Tarihi">
        </el-table-column>
        <el-table-column prop="sellAmount" label="Satış Tutarı">
          <template v-slot="scope">
            {{ scope.row.sellAmount | formatNumber }}
          </template>
        </el-table-column>
        <el-table-column prop="collectionDate" label="Tahs. Tarihi">
        </el-table-column>
        <el-table-column prop="collectionAmount" label="Tahs. Tutarı">
          <template v-slot="scope">
            {{ scope.row.collectionAmount }}
          </template>
        </el-table-column>
        <el-table-column prop="remaining" label="Önceki Borç">
          <template v-slot="scope">
            {{ scope.row.remaining | formatNumber }}
          </template>
        </el-table-column>
        <!-- <el-table-column
          prop="outstandingDebt"
          label="Devreden">
          <template v-slot="scope">
            {{ scope.row.outstandingDebt | formatNumber }}
          </template>
        </el-table-column> -->
      </el-table>
      <span slot="footer" class="dialog-footer">
        <el-button @click="createRouteDialog = false">Vazgeç</el-button>
        <el-button type="primary" icon="el-icon-printer" @click="printRoute" :disabled="!getRouteList.length">Çıktı Al</el-button>
      </span>
    </el-dialog>

    <div id="print-area" style="display:none;">
      <table class="print-table">
        <thead>
          <tr>
            <th>Firma</th>
            <th>İşlem Tarihi</th>
            <th>Satış Tutarı</th>
            <th>Tahs. Tarihi</th>
            <th>Tahs. Tutarı</th>
            <th>Önceki Borç</th>
            <th>Güncel Borç</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in getRouteList" :key="row.companyName">
            <td>{{ row.companyName }}</td>
            <td>{{ row.createdDate }}</td>
            <td>{{ row.sellAmount }}</td>
            <td>{{ row.collectionDate }}</td>
            <td>{{ row.collectionAmount }}</td>
            <td>{{ row.remaining | formatNumber }}</td>
            <td>{{ row.currentDebt }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <el-dialog
      :title="getPopupTitle"
      :visible.sync="dialogVisible"
      width="37%"
      @close="closePopup"
    >
      <el-form label-position="top" :model="formData" label-width="100px">
        <h4 class="mb-3">{{ getCurrentCompany.replace('-', '') }}</h4>
        <!-- <el-alert
          v-if="!isEditMode"
          title="Bu ekranda, yeni satış ya da tahsilat işlemi yapabilirsiniz."
          type="info"
          :closable="false"
          show-icon>
        </el-alert> -->
        <hr>
        <!-- <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Ad Soyad">
              <el-input v-model="fullName" disabled> </el-input>
            </el-form-item>
          </el-col>
        </el-row> -->
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="İşlem Tarihi" class="picker-width">
              <el-date-picker
                v-model="filter.transactionDate"
                type="date"
                format="dd.MM.yyyy"
                placeholder=""
              >
              </el-date-picker>
            </el-form-item>
          </el-col>
          
          <el-col :span="12">
            <el-form-item label="Satış Tutarı">
              <price-input v-model="formData.sellAmount" :decimals="2" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Tahsilat Tarihi" class="picker-width">
              <el-date-picker
              v-model="filter.collectionDate"
              type="date"
              format="dd.MM.yyyy"
              placeholder=""
              >
            </el-date-picker>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="Tahsil Edilen">
              <price-input v-model="formData.collectionAmount" :decimals="2" :min="0" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Devreden Borç">
              <price-input v-model="formData.outstandingDebt" :decimals="2" :min="0" :disabled="!checkOutstandingDebt" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="İşlemden Kalan Borç">
              <price-input :value="calcRemaining" disabled />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="Not" prop="note">
              <el-input
                type="textarea"
                class="no-resize-textarea"
                v-model="formData.note"
                placeholder="Açıklama girin"
                :autosize="false"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <h4 class="total-debt">
              <div>
                <strong>Toplam Borç:</strong>
                <p v-if="formData.outstandingDebt > 0" class="text-xsmall mb-0 absolute">(Devreden borç dahil edilmiştir.)</p>
              </div>
              {{ getTotalDebt | formatNumber }}₺</h4>
          </el-col>
        </el-row>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">Vazgeç</el-button>
        <el-button type="primary">Kaydet</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import transactions from "@/mock/transactions.json";
import { formatNumber } from '@/util/helpers';
import PriceInput from '@/components/forms/PriceInput.vue';
import globalMixin from '@/mixins/global.mixin.js';
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import logoImage from "@/assets/images/logo.png";

export default {
  name: "Customers",
  mixins: [globalMixin],
  components: {
    PriceInput,
  },
  data() {
    return {
      pageSize: 9,
      currentPage: 1,
      currentCustomerId: null,
      dialogVisible: false,
      createRouteDialog: false,
      filter: {
        transactionDateStart: "",
        transactionDateEnd: "",
        collectionDateStart: "",
        collectionDateEnd: "",
        search: "",
        group: "",
        groupForRoute: "",
        visitType: "Tümü",
        isOutstandingDebt: 0,
      },
      exportTableData: [],
      tempRows: {},
      tempTransactionId: null,
      isEditMode: false,
      isTransactionsDetail: false,
      formData: {
        companyName: '',
        fullName: '',
        transactionDate: null,
        sellAmount: 0,
        collectionAmount: 0,
        collectionDate: null,
        remaining: 0,
        note: ""
      }
    }
  },
  mounted () {
    this.currentCustomerId = this.$route.query?.q;
  },
  computed: {
    getPopupTitle() {
      return this.isEditMode ? 'Hareketi Düzenle' : 'Yeni Satış Oluştur';
    },
    getTransactionList() {
      return transactions;
    },
    checkOutstandingDebt() {
      return this.isEditMode ? !this.isTransactionsDetail : "";
    },
    paginatedData() {
      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.filteredData?.slice(start, end);
    },
    calcTotalDebt() {
      return (scope2) => this.tempRows[scope2.row.parentId].remaining - this.tempRows[scope2.row.parentId].collectionAmount;
      /* return (scope, scope2) => this.tempRows.length > 1 ? this.tempRows[scope2.row.parentId].remaining - this.tempRows[scope2.row.parentId].collectionAmount : scope.remaining - this.tempRows[scope2.row.parentId]?.collectionAmount; */
    },
    getRouteList() {
      return this.exportTableData.filter(item => {
        if (this.filter.groupForRoute) {
          if (item.group !== Number(this.filter.groupForRoute)) return false;
        }

        if (this.filter.visitType === 1) {
          if (!(item.remaining > 0)) return false;
        }

        /* if (this.filter.isOutstandingDebt === 1) {
          if (!(item.outstandingDebt > 0)) return false;
        } */

        return true;
      });
    },
    todayGroupNumber() {
      const today = new Date().getDay();
      if (today === 0) {
        return null;
      }
      return today;
    },
    filteredData() {
      let list = this.getTransactionList || [];

      if (this.currentCustomerId) {
        list = list.filter(
          item => String(item.customerId) === String(this.currentCustomerId)
        );
      }

      if (this.filter.group) {
        list = list.filter(
          item => String(item.companyId) === String(this.filter.group)
        );
      }

      if (!this.filter.search) {
        return list;
      }

      const search = this.filter.search.toLowerCase();
      return list.filter(item =>
        `${item.fullName} ${item.companyName}`.toLowerCase().includes(search)
      );
    },
    calcRemaining() {
      return this.formData.sellAmount - this.formData.collectionAmount;
    },
    getTotalDebt() {
      return this.calcRemaining + this.formData.outstandingDebt;
    },
    getCurrentCompany() {
      const companyName = this.paginatedData.filter(t => t.customerId == this.currentCustomerId)[0]?.companyName;
      return companyName ? `${companyName}` : '';
    }
  },
  methods: {
    handlePageChange(page) {
      this.currentPage = page;
    },
    cancelProcess(row) {
      this.expand(row, false);
      this.tempTransactionId = null;
    },
    saveNewProcess(row) {
      this.expand(row, false);
      this.$notify.success({
        title: 'Başarılı',
        message: 'İşlem Gerçekleştirildi'
      });
    },
    async printRoute() {
      const grouped = this.getRouteList.reduce((acc, item) => {
        if (!acc[item.companyName]) acc[item.companyName] = [];

        acc[item.companyName].push(item);
        return acc;
      }, {});

      const body = [
        [
          "Firma",
          "İşlem Tarihi",
          "Satış Tutarı",
          "Tahs. Tarihi",
          "Tahs. Tutarı",
          "Kalan",
          "Açıklama"
        ]
      ];

      Object.keys(grouped).forEach(company => {
        const list = grouped[company];
        const head = list[0];

        body.push([
          head.companyName,
          "",
          "",
          "",
          "",
          "",
          { text: head.note || "", rowSpan: 2, alignment: 'center' }
        ]);

        const totalAmount = list.reduce((sum, item) => sum + (item.sellAmount || 0), 0);
        const totalRemainingResult = list.reduce((sum, item) => sum + (item.remaining || 0), 0);
        
        const pastDates = [...list.map(i => i.transactionDate), { text: "Toplam", bold: true }]
        const pastAmounts = [...list.map(i => this.$options.filters.formatNumber(i.sellAmount)), { text: this.$options.filters.formatNumber(totalAmount), bold: true }]
        const totalRemaining = [...list.map(i => this.$options.filters.formatNumber(i.remaining)), { text: this.$options.filters.formatNumber(totalRemainingResult), bold: true }];
        
        body.push([
          "",
          pastDates,
          pastAmounts,
          "",
          "",
          totalRemaining,
          "",
        ]);
      });

      async function toBase64(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise(resolve => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }

      const logo = await toBase64(logoImage);

      const docDefinition = {
        content: [
          {
            image: logo,
            width: 150,
            alignment: 'center',
            margin: [0, -20, 0, 0]
          },
          { text: "", style: "header" },
          {
            table: {
              headerRows: 1,
              widths: [100, 55, "*", 55, "*", "*", 80],
              body
            },
            layout: {
              fillColor: rowIndex => rowIndex === 0 ? '#CCCCCC' : null
            },
            fontSize: 10
          }
        ],
        styles: {
          header: {
            bold: false,
            margin: [0, 0, 0, 10],
            alignment: 'center'
          }
        }
      };

      pdfMake.createPdf(docDefinition).open();
    },
    openCreateRouteDialog() {
      this.createRouteDialog = true;
      this.exportTableData = this.getTransactionList.map(item => ({
        companyName: item.companyName,
        transactionDate: this.$options.filters.formatDate(item.transactionDate),
        sellAmount: item.sellAmount,
        collectionDate: this.$options.filters.formatDate(item.collectionDate),
        collectionAmount: this.$options.filters.formatNumber(item.collectionAmount),
        remaining: item.remaining,
        outstandingDebt: this.$options.filters.formatNumber(item.outstandingDebt),
        currentDebt: "",
        group: item.group,
        previousTransactions: item?.previousTransactions?.slice()
      }));
      this.filter.groupForRoute = this.todayGroupNumber + 1;
    },
    addNewRow(row) {
      const id = row.id;
      this.tempTransactionId = id;
      this.$set(this.tempRows, id, {
        parentId: id,
        sellAmount: null,
        collectionDate: new Date().toLocaleDateString('en-CA'),
        collectionAmount: null,
        remaining: row.remaining || row.outstandingDebt
        /* row.previousTransactions[row.previousTransactions.length -1]?.remaining || 0 */
      });

      this.expand(row);
    },
    expand(row, status = true) {
      if (!status) {
        this.tempRows = {};
        this.tempTransactionId = null;
      }

      this.$nextTick(() => {
        this.$refs.mainTable.toggleRowExpansion(row, status);
      });
    },
    closePopup() {
      this.dialogVisible = false;
    },
    closeRouteDialog() {
      this.createRouteDialog = false;
    },
    isOpenDialog(type, row = {}, isChild = false) {
      this.isEditMode = type === 'edit';
      this.isTransactionsDetail = isChild;
      
      if (this.isEditMode) {
        this.fillForm(row);
      } else {
        this.resetFormData();
      }
      this.formData.companyName = row.companyName || '';
      this.dialogVisible = true;
    },
    resetFormData() {
      this.formData = {
        companyName: '',
        fullName: '',
        transactionDate: null,
        sellAmount: 0,
        collectionAmount: 0,
        collectionDate: null,
        remaining: 0,
        outstandingDebt: 0,
        note: ""
      };
    },
    fillForm(row) {
      this.formData = {
        ...this.formData,
        ...row,
      };
    },
    newRecord() {
      /* dialog açmalı; İşlem tarihi, satış tutarı, tahsilat tarihi, tahsilat tutarı girilecek. anlık kalan görünüyor olacak. ek olarak devreden de disable görünse iyi olur. */
      /* this.$router.push({ name: 'transaction-detail', params: { id } }); */
    },
    getSummaries(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 1) {
          sums[index] = 'Toplam';
          return;
        }
        
        const isCalculatable =
          column?.property &&
          (column.property.includes('sellAmount') ||
          column.property.includes('collectionAmount') ||
          column.property.includes('remaining') ||
          column.property.includes('outstandingDebt'));
        
        if (isCalculatable) {
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
    getSummariesRoute(param) {
      const { columns } = param;
      const sums = [];

      columns.forEach((column, index) => {
        if (index === 0) {
          sums[index] = 'Toplam';
          return;
        }
        
        const isCalculatable =
          column?.property &&
          column.property.includes('remaining');
        
        if (isCalculatable) {
          const values = this.getRouteList?.map(item => Number(item[column.property]));
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
  watch: {
    "$route": {
      handler(value) {
        if (value.query?.q) {
          this.currentCustomerId = value.query.q;
          return;
        }
        this.currentCustomerId = null;
      },
      immediate: true,
      deep: true
    }
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .w-full {
    width: 100%;
  }
  .el-table__cell.el-table__expanded-cell {
    padding-top: 0 !important;
    padding-bottom: 0 !important;

    .el-table__header-wrapper {
      display: none;
    }
  }
  .transaction-detail {
    padding-left: 662px;
    &.revise {
      padding-left: 482px !important;
    }
    .el-table--border {
      border-right: none;
      border-top: none;
    }
  }
  .total-debt {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 50px;
  }
}
</style>