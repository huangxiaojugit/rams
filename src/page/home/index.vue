<template>
  <div class="container">
    <!-- <Header /> -->
    <div class="header"></div>
    <div class="board">
      <div>{{ $t("ramsaddress") }}:{{ dataList.length }}</div>
      <div>
        {{ $t("ramsprogress") }}: {{ allMintNum + " / " + totalSupply }} （{{
          ((allMintNum * 100) / totalSupply).toFixed(4)
        }}%）
      </div>
    </div>
    <div class="content">
      <a-tabs default-active-key="1" @change="handleChangeTab">
        <a-tab-pane key="rams" :tab="$t('ramsranking')">
          <a-table
            size="small"
            :loading="isLoading"
            :columns="columns"
            :data-source="dataList"
            :pagination="pagination"
          >
          </a-table>
        </a-tab-pane>
        <a-tab-pane key="ram" :tab="$t('ramranking')" force-render>
          <a-table
            size="small"
            :loading="isLoading"
            :columns="ramColumns"
            :data-source="ramList"
            :pagination="false"
          >
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import EosApi from "eosjs-api";
import axios from "axios";
// import Header from "../../components/Header/index.vue";
const columns = [
  {
    title: "Index",
    key: "index",
    dataIndex: "index",
  },
  { title: "Account", dataIndex: "username", key: "username" },
  { title: "RAMS", dataIndex: "mintcount", key: "mintcount" },
];

const ramColumns = [
  {
    title: "Index",
    key: "index",
    dataIndex: "index",
  },
  { title: "Account", dataIndex: "username", key: "username" },
  { title: "RAM", dataIndex: "ram", key: "ram" },
  { title: "RAMS", dataIndex: "rams", key: "rams" },
];

const eos = EosApi({
  httpEndpoint: "https://eos.greymass.com",
  verbose: false,
  fetchConfiguration: {},
});

export default {
  name: "App",
  components: {
    // Header,
  },
  data() {
    return {
      isLoading: false,
      columns: columns,
      dataList: [],
      pagination: {
        defaultPageSize: 100,
      },
      ramList: [],
      ramColumns: ramColumns,
      allMintNum: 0,
      totalSupply: 100000000,
    };
  },
  mounted() {
    this.getMintNum();
    this.getRamsList();
  },
  methods: {
    /**
     * 获取铭文进度
     */
    getMintNum() {
      eos
        .getTableRows({
          json: true,
          limit: 1,
          code: "rams.eos",
          scope: "rams.eos",
          table: "status",
          reverse: true,
          lower_bound: "",
          upper_bound: "",
        })
        .then((res) => {
          this.allMintNum =
            (res.rows && res.rows[0] && res.rows[0].minted) || 0;
        });
    },
    handleChangeTab(e) {
      if (e === "rams") {
        this.getRamsList();
      } else if (e === "ram") {
        this.getRam100List();
      }
      console.log("handleChangeTab", e);
    },
    getRamsList(next_key = null) {
      this.isLoading = true;
      const eos = EosApi({
        httpEndpoint: "https://eos.greymass.com",
        verbose: false,
        fetchConfiguration: {},
      });
      eos
        .getTableRows({
          json: true,
          code: "rams.eos",
          scope: "rams.eos",
          table: "users",
          lower_bound: next_key,
          upper_bound: null,
          index_position: 1,
          key_type: "",
          limit: "1000",
          reverse: false,
          show_payer: true,
        })
        .then((res) => {
          const { next_key } = res || {};
          if (next_key) {
            this.getRamsList(next_key);
          }

          let rowList = res.rows.map((v) => {
            return {
              username: v.payer,
              mintcount: v.data.mintcount,
            };
          });
          this.dataList.push(...rowList);

          this.dataList = this.dataList
            .sort((a, b) => b.mintcount - a.mintcount)
            .map((v, index) => {
              return {
                ...v,
                index: index + 1,
              };
            });
        })
        .catch((err) => {
          console.log("err", err);
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
    getRam100List() {
      if (this.ramList.length != 0) {
        return;
      }
      this.isLoading = true;
      axios
        .get("https://api.light.xeos.me/api/topram/eos/100")
        .then((res) => {
          console.log("res", res);
          const { data = [] } = res || {};
          let ramsMap = {};
          this.dataList.forEach((v) => {
            ramsMap[v.username] = v.mintcount;
          });
          this.ramList = data.map((v, index) => {
            let showRamNum = v[1] / 1024 / 1024;
            if (showRamNum >= 1024) {
              showRamNum = `${(showRamNum / 1024).toFixed(2)} GB`;
            } else {
              showRamNum = `${showRamNum.toFixed(2)} MB`;
            }
            return {
              index: index + 1,
              username: v[0],
              ram: showRamNum,
              rams: ramsMap[v[0]] || "",
            };
          });
        })
        .finally(() => {
          this.isLoading = false;
        });
    },
  },
};
</script>

<style scoped>
.container {
  min-height: 100vh;
  background: linear-gradient(135deg, #fff5d9, #fffdf8);
  padding-bottom: 40px;
}
.header {
  height: 1px;
}
.content {
  max-width: 1200px;
  background-color: #fff;
  font-weight: bold;
  width: 80%;
  margin: 0 auto;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 0.5px,
    rgba(0, 0, 0, 0.024) 0px 0px 5px, rgba(0, 0, 0, 0.05) 0px 1px 2px;
}

.board {
  font-weight: bold;
  max-width: 1200px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  width: 80%;
  display: flex;
  align-items: center;
  margin: 20px auto 20px auto;
  height: 64px;
  padding: 0 20px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 0.5px,
    rgba(0, 0, 0, 0.024) 0px 0px 5px, rgba(0, 0, 0, 0.05) 0px 1px 2px;
}

::v-deep .ant-tabs-bar {
  margin-bottom: 0;
}
::v-deep .ant-table-small {
  border: none;
}

@media screen and (max-width: 640px) {
  /* .header {
    height: 60px;
  } */
  .content {
    width: 98%;
  }
  .board {
    font-size: 12px;
    flex-direction: column;
    width: 98%;
  }
}
</style>
