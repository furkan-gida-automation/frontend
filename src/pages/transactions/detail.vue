<template>
    <div>
      <div class="page-header">
        <h3 class="page-title">
          <div>
            <span class="page-title-icon bg-gradient-success text-white mr-2">
              <i class="mdi mdi-file-find menu-icon"></i>
            </span>
            Ender İmen - Tahsilat Detayları
          </div>
          <el-button type="success" size="medium" icon="el-icon-circle-plus" @click="handleClick(scope.row)">Yeni İşlem Oluştur</el-button>
          <!-- isme göre group by yapılmalı (zaten tek kişi görünüyor olacak) -->
        </h3>
      </div>
      <div class="card">
        <div class="card-body">
          <div class="row">
            <div class="col-3 col-sm-4 col-md-2 mb-3">
              <el-input
                v-model="filter.search"
                placeholder="Müşteri Ara..."
                clearable
                prefix-icon="el-icon-search"
              />
            </div>
            <div class="col-2 col-sm-4 col-md-2 mb-3 pl-0">
              <el-date-picker
                class="w-full"
                v-model="filter.transactiondDate"
                type="date"
                format="dd.MM.yyyy"
                placeholder="Satış tarihi seçin"
                @change="currentPage = 1"
              >
              </el-date-picker>
            </div>
            <div class="col-2 col-sm-4 col-md-2 mb-3 pl-0">
              <el-date-picker
                class="w-full"
                v-model="filter.collectionDate"
                type="date"
                format="dd.MM.yyyy"
                placeholder="Tahsilat tarihi seçin"
                @change="currentPage = 1"
              >
              </el-date-picker>
            </div>
            <div class="col-12 grid-margin">
              <el-table
                :data="paginatedData"
                border
                style="width: 100%"
                show-summary
                :summary-method="getSummaries"
                empty-text="Tahsilat Hareketi bulunamadı"
              >
                <!-- <el-table-column prop="id" label="ID" width="180"></el-table-column> -->
                <el-table-column prop="fullName" label="Adı - Soyadı" width="180">
                  <template v-slot="scope">
                    {{ scope.row.fullName }}
                  </template>
                </el-table-column>
                <el-table-column prop="createdDate" label="Satış Tarihi" width="115">
                  <template v-slot="scope">
                    {{ scope.row.transactiondDate | formatDate }}
                  </template>
                </el-table-column>
                <el-table-column prop="sellAmount" label="Satış Tutarı" width="130" sortable>
                  <template v-slot="scope">
                    {{ scope.row.sellAmount | formatNumber }}
                  </template>
                </el-table-column>
                <el-table-column prop="collectionDate" label="Tahsilat Tarihi" width="115">
                  <template v-slot="scope">
                    {{ scope.row.collectionDate | formatDate }}
                  </template>
                </el-table-column>
                <el-table-column prop="collectionAmount" label="Tahsilat Tutarı" width="137" sortable>
                  <template v-slot="scope">
                    {{ scope.row.collectionAmount | formatNumber }}
                  </template>
                </el-table-column>
                <el-table-column prop="outstandingDebt" label="Devreden Borç" width="140"  sortable>
                  <template v-slot="scope">
                    {{ scope.row.outstandingDebt | formatNumber }}
                  </template>
                </el-table-column>
                <el-table-column prop="remaining" label="Kalan Borç" sortable width="115">
                  <template v-slot="scope">
                    {{ scope.row.remaining | formatNumber }}
                  </template>
                </el-table-column>
                <el-table-column prop="note" label="Not"></el-table-column>
                <el-table-column fixed="right" label="İşlem" width="240">
                  <template v-slot="scope">
                    <el-button type="success" size="small" icon="el-icon-notebook-2" @click="handleClick(scope.row.customerId)">Hareketleri Gör</el-button>
                    <el-button type="primary" size="small" icon="el-icon-edit" circle @click="isOpenDialog('edit', scope.row)"></el-button>
                    <el-button type="danger" size="small" icon="el-icon-delete" circle @click="open(scope.row)" :disabled="scope.row.totalOutputWeight > 0"></el-button>
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
    </div>
  </template>
  
  <script>
  import transactions from "@/mock/transactions.json";
  import { formatNumber } from '@/util/helpers';
  
  export default {
    name: "TransactionDetail",
    data() {
      return {
        pageSize: 9,
        currentPage: 1,
        filter: {
          search: "",
        },
      }
    },
    computed: {
      getTransactionList() {
        return transactions;
      },
      paginatedData() {
        const start = (this.currentPage - 1) * this.pageSize
        const end = start + this.pageSize
        return this.filteredData?.slice(start, end);
      },
      filteredData() {
        if (!this.filter.search) return this.getTransactionList;
        return this.getTransactionList?.filter(item =>
          `${item.fullName}`.toLowerCase().includes(this.filter.search.toLowerCase())
        );
      },
    },
    methods: {
      handlePageChange(page) {
        this.currentPage = page;
      },
      handleClick(id) {
        this.$router.push({ name: 'transaction-detail', params: { id } });
      },
      getSummaries(param) {
        const { columns } = param;
        const sums = [];
  
        columns.forEach((column, index) => {
          if (index === 0) {
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
    },
  }
  </script>
  
  <style scoped lang="scss">
  ::v-deep {
    .w-full {
      width: 100%;
    }
  }
  </style>