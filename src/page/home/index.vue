<template>
  <div class="container">
    <div class="header">
      <div class="header-content">
        <div>
          <img src="../../assets/logo.png" class="logo" />
        </div>
        <div>
          <a href="https://about.eosram.info/" target="”_blank”">文档</a>
        </div>
      </div>
    </div>
    <div class="board">
      <div>{{ $t("ramsaddress") }}:{{ dataList.length }}</div>
      <div>
        {{ $t("ramsprogress") }}: {{ allMintNum + " / " + totalSupply }} （{{
          ((allMintNum * 100) / totalSupply).toFixed(4)
        }}%）
      </div>
      <div class="board-tg">
        <div>Telegram：</div>
        <div class="board-tg-item">
          <div>
            <a href="https://t.me/rambroclub" target="”_blank”"
              >t.me/rambroclub</a
            >
          </div>
          <div>
            <a href="https://t.me/rams_in_ram" target="”_blank”"
              >t.me/rams_in_ram</a
            >
          </div>
        </div>
      </div>
    </div>
    <div class="content">
      <a-tabs default-active-key="1" @change="handleChangeTab">
        <a-tab-pane key="rams" :tab="$t('ramsranking')">
          <a-table
            size="small"
            :loading="isLoading"
            :columns="columns"
            :data-source="showTableList"
            :pagination="pagination"
          >
            <span slot="username" slot-scope="text">
              <a
                :href="`https://eosflare.io/account/${text}`"
                target="”_blank”"
                >{{ text }}</a
              >
            </span>
          </a-table>
        </a-tab-pane>
        <div slot="tabBarExtraContent" class="tabBarExtraContent">
          <a-input
            size="small"
            v-model="search.userName"
            :placeholder="$t('searchUserName')"
          >
          </a-input>
        </div>
        <!-- <a-tab-pane key="ram" :tab="$t('ramranking')" force-render>
          <a-table
            size="small"
            :loading="isLoading"
            :columns="ramColumns"
            :data-source="ramList"
            :pagination="false"
          >
          </a-table>
        </a-tab-pane> -->
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
  {
    title: "Account",
    dataIndex: "username",
    key: "username",
    scopedSlots: { customRender: "username" },
  },
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
  httpEndpoint: "https://api.eossupport.io",
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
      search: {
        userName: undefined,
      },
    };
  },
  mounted() {
    this.getMintNum();
    this.getRamsList();
  },
  computed: {
    showTableList() {
      return this.dataList.filter((v) => {
        if (!this.search.userName) {
          return true;
        }
        if (this.search.userName && v.username.includes(this.search.userName)) {
          return true;
        }
        return false;
      });
    },
  },
  methods: {
    handleAccountDetail() {},
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
      // if (e === "rams") {
      //   this.getRamsList();
      // } else if (e === "ram") {
      //   this.getRam100List();
      // }
      console.log("handleChangeTab", e);
    },
    getRamsList(next_key = null) {
      this.isLoading = true;
      const eos = EosApi({
        httpEndpoint: "https://api.eossupport.io",
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
}
.header {
  height: 40px;
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 0.5px,
    rgba(0, 0, 0, 0.024) 0px 0px 5px, rgba(0, 0, 0, 0.05) 0px 1px 2px;
}

.logo {
  width: 30px;
  cursor: pointer;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto;
  height: 100%;
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
  margin: 20px auto;
  min-height: 64px;
  padding: 0 20px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 0.5px,
    rgba(0, 0, 0, 0.024) 0px 0px 5px, rgba(0, 0, 0, 0.05) 0px 1px 2px;
}

.board-tg {
  display: flex;
  align-items: center;
}

.tabBarExtraContent {
  margin-right: 10px;
}

::v-deep .ant-tabs-bar {
  margin-bottom: 0;
}
::v-deep .ant-table-small {
  border: none;
}

::v-deep .ant-table-content {
  overflow-y: scroll;
  max-height: calc(100vh - 220px - 40px);
}
@media screen and (max-width: 640px) {
  /* .header {
    height: 60px;
  } */
  .content {
    width: 96%;
  }
  .board {
    font-size: 12px;
    flex-direction: column;
    width: 96%;
    margin: 10px auto;
    padding: 5px 0;
  }

  .board-tg {
    display: flex;
    /* align-items: center; */
  }
  .board-tg-item {
    display: flex;
    justify-content: space-between;
  }

  .board-tg-item > div {
    margin: 0 10px;
  }

  ::v-deep .ant-table-content {
    overflow-y: scroll;
    max-height: calc(100vh - 190px - 40px);
  }

  ::v-deep .header-content {
    width: 96%;
  }
}
</style>
