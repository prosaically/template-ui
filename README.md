# template-ui

## IDEA 配置
```text

安装 Vue.js
Other Settings -> Plugins -> 搜索 -> Install -> 重启
IDEA 2020.X
New Projects Settings -> Plugins -> 搜索 -> Install -> 重启

配置 Vue 代码格式
Other Settings -> Editor -> Code Style -> Vue [ Tabs And Indents ]

IDEA 2020.X
New Projects Settings -> Editor -> Code Style -> Vue [ Tabs And Indents ]
  
  // 不能使用块
  Specific to the language in the block
√ Same in the whole file
      // 不能使用 tab 字符，不同开发工具字符不一样
	  Use tab character
		  Smart tabs
	// Tab 代表的空格数
	Tab size : 4
	// 缩进空格数
	Indent : 4
	// 换行缩进空格数
	Continuation indent : 4
	
    // Vue 根标签缩进
   Indent children of top-level tag : template,script,style

```


## 项目安装
```shell script
npm install

# Node.JS版本15.x及以上
# @vue/cli版本5.x
```

### 开发服务
```shell script
npm run serve
```

### 编译项目
```shell script
npm run build
```

### 检查代码
```shell script
npm run lint
```

### 分析项目
```shell script
npm run build --report

# 注：请不要重新安装“webpack-bundle-analyzer”
```

### Vue文档
Vue.js [使用参考](https://cn.vuejs.org/v2/guide/)

Vue Router [使用参考](https://router.vuejs.org/zh/installation.html)

Vue CLI [使用参考](https://cli.vuejs.org/zh/guide/installation.html)

vue.config.js [配置参考](https://cli.vuejs.org/config/)

Vuex [使用参考](https://vuex.vuejs.org/zh/guide/)

### UI框架
Element UI [使用参考](https://element.eleme.cn/#/zh-CN/component/quickstart)

Sass [使用参考](https://www.sass.hk/docs/)

注：能使用UI框架的，就不自己造轮子。

### 别名引用
```javascript
// @是/src的别名
import HelloWorld from "@/components/HelloWorld.vue";

export default {
    name: "Home",
    components: {
        HelloWorld
    }
};
```

### 路由写法

导入主包写法
```javascript
// 会增加主包大小，不推荐使用
import Home from "./src/views/Home.vue";
const routes = [{
    path: "/",
    name: "Home",
    // 是否需要授权
    meta: { requireAuth: true },
    component: Home
}];
```

延迟加载写法（使用写法）
```javascript
// 推荐使用，加速首次加载
const routes = [{
    path: "/",
    name: "Home",
    // 是否需要授权
    meta: { requireAuth: true },
    // /* webpackChunkName: "about" */ -> 配置拆分打包名(about.[hash].js)
    component: () => import(/* webpackChunkName: "home" */ "./src/views/Home.vue")
}];
```

### 计算精度
请查看 [使用参考](https://github.com/nefe/number-precision)
```javascript
// = 0.1
this.$number.strip(0.09999999999999998);
// = 0.3, not 0.30000000000000004
this.$number.plus(0.1, 0.2);
// = 4.7, not 4.699999999999999
this.$number.plus(2.3, 2.4);
// = 0.1, not 0.09999999999999998
this.$number.minus(1.0, 0.9);
// = 0.9, not 0.8999999999999999
this.$number.times(3, 0.3); 
// = 36.2, not 36.199999999999996
this.$number.times(0.362, 100);
// = 1.1, not 1.0999999999999999
this.$number.divide(1.21, 1.1);
// = 0.11, not 0.1
this.$number.round(0.105, 2);
```
注：请勿重新造轮子。

### Ajax请求
Ajax 工具 [使用参考](https://github.com/axios/axios)

URL参数工具 [使用参考](https://github.com/ljharb/qs)
```shell script
this.$http.request(config);
this.$http.get(url[, config]);
this.$http.delete(url[, config]);
this.$http.head(url[, config]);
this.$http.options(url[, config]);
this.$http.post(url[, data[, config]]);
this.$http.put(url[, data[, config]]);
this.$http.patch(url[, data[, config]]);
```

### 项目结构
创建Vue组件时请注意命名！
```shell script
# 错误示例
src/address/List.vue
src/card/List.vue
src/goods/List.vue

# 正确示例
src/address/AddressList.vue
src/card/CardList.vue
src/goods/GoodsList.vue

# 错误示例原因
# 在使用 <keep-alive :include="['name']"></keep-alive> 时会造成三个组件全部缓存。
# 这时就需要处理缓存带来的数据不刷新问题，因为组件名一样， keep-alive 会认为是同一组件。

```

### 权限指令
VUE 指令验证
```vue
// v-authority 指令名称
// .           分隔符号
// b-c         权限名称
// 拥有 b-c 或者 d-e 权限时显示元素
<div class="welcome" v-authority.b-c.d-e />
```
JS 方法验证
```javascript
// 拥有 b-c 或者 d-e 权限时显示元素
this.$hasAuthority("b-c", "d-e");
```

### 字体图标
新增字体图标
1. 进入 [阿里矢量图标库](https://www.iconfont.cn)
2. 搜索心仪图标加入购物车
3. 进购物车将图标加入项目（控制台）
4. 进项目（控制台）编辑刚加入图标（编辑内容包含大小、名称、颜色）
5. 下载图标到本地，复制文件到项目`iconfont.css; .ttf; .woff; .woff2`

修改 `iconfont.css` 文件
```less
// 下载CSS
.eui-icon {
    font-family: "eui-icon" !important;
    font-size: 16px;        // 切勿漏删
    font-style: normal;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

// 修改CSS
[class*=" eui-icon-"], [class^=eui-icon-] {
  font-family: "eui-icon" !important;
  font-style: normal;
  display: inline-block;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Vue 模板
#### 查询模板
```vue
<template>
    <div class="member-query">
        <!-- 条件搜索 -->
        <div class="member-query-search">
            <el-input clearable placeholder="请输入会员名" v-model="membername">
                <template slot="prepend">会员名</template>
            </el-input>
            <el-input clearable placeholder="请输入手机号" v-model="mobile">
                <template slot="prepend">手机号</template>
            </el-input>
            <el-input clearable placeholder="请输入公司名" v-model="companyname">
                <template slot="prepend">公司名</template>
            </el-input>
            <MemberGroup v-model="membergroup" prepend="新类型" />
            <MemberState v-model="disable" prepend="状态" />
            <MemberType v-model="membertype" prepend="类型" />
            <el-date-picker
                v-model="dates"
                :editable="false"
                type="datetimerange"
                format="yyyy-MM-dd HH:mm:ss"
                value-format="yyyy-MM-dd HH:mm:ss"
                range-separator="-"
                start-placeholder="注册开始日期"
                end-placeholder="注册结束日期"
            />

            <div class="member-query-search-gap"></div>

            <el-button-group>
                <el-button type="primary" @click="search" v-authority.member-query>查询</el-button>
                <el-dropdown @command="command">
                    <el-button type="primary">更多菜单 <i class="el-icon-arrow-down"></i></el-button>
                    <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item command="query" v-authority.member-query>查看</el-dropdown-item>
                        <el-dropdown-item command="add" v-authority.member-add>新增</el-dropdown-item>
                        <el-dropdown-item command="modify" v-authority.member-update>编辑</el-dropdown-item>
                        <el-dropdown-item command="remove" v-authority.member-delete>删除</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
            </el-button-group>
        </div>

        <!-- 数据列表 -->
        <el-table
            :data="records"
            stripe
            style="height: auto; width: 100%"
            ref="table"
            @selection-change="selectionChange"
        >
            <el-table-column type="selection" width="60" />
            <el-table-column prop="membername" label="会员名" width="200" />
            <el-table-column prop="sexEnum.desc" label="性别" width="80" />
            <el-table-column prop="membercontact" label="联系人" width="160" />
            <el-table-column prop="mobile" label="手机号" width="160" />
            <el-table-column prop="tel" label="电话" width="160" />
            <el-table-column prop="email" label="邮箱" width="160" />
            <el-table-column prop="registerDate" label="注册时间" width="240" />
            <el-table-column prop="companyname" label="公司名" />
        </el-table>

        <!-- 分页栏 -->
        <el-pagination
            background
            layout="total, prev, pager, next"
            :page-size="pageSize"
            :total="total"
            :current-page="pageNo"
            @current-change="pageChange"
        />

        <!-- 查看窗口 -->
        <el-dialog title="详细信息" :visible.sync="visible" top="10vh" width="60%">
            <MemberForm :member-id="memberId" readonly />
        </el-dialog>
    </div>
</template>

<script>
    import {
        Input,
        ButtonGroup,
        Button,
        Table,
        TableColumn,
        Dialog,
        Pagination,
        DatePicker,
        Dropdown,
        DropdownMenu,
        DropdownItem
    } from "element-ui";
    import MemberType from "@/views/member/MemberType";
    import MemberState from "@/views/member/MemberState";
    import MemberGroup from "@/views/member/MemberGroup";
    import MemberForm from "@/views/member/MemberForm";

    export default {
        name: "MemberQuery",
        data() {
            return {
                pageNo: 0,
                pageSize: 0,
                total: 0,
                records: [],

                memberId: undefined,
                membername: "",
                mobile: "",
                companyname: "",
                membergroup: "",
                disable: "",
                membertype: "",
                dates: ["", ""],

                selections: [],
                model: "",
                visible: false,
                loading: false,
                leaving: false
            };
        },
        computed: {
            registerDateStart: {
                set(v) {
                    // eslint-disable-next-line no-unused-vars
                    let [start, end = ""] = this.dates || [];
                    this.dates = [v || "", end];
                },
                get() {
                    return (this.dates || [])[0];
                }
            },
            registerDateEnd: {
                set(v) {
                    let [start = ""] = this.dates || [];
                    this.dates = [start, v || ""];
                },
                get() {
                    return (this.dates || [])[1];
                }
            }
        },
        methods: {
            search() {
                let kvs = this.$clone(this.$route.query);
                kvs.membername = this.membername;
                kvs.mobile = this.mobile;
                kvs.companyname = this.companyname;
                kvs.membergroup = this.membergroup;
                kvs.disable = this.disable;
                kvs.membertype = this.membertype;
                kvs.registerDateStart = this.registerDateStart;
                kvs.registerDateEnd = this.registerDateEnd;
                kvs.pageSize = this.pageSize;
                kvs.pageNo = this.pageNo = 1;
                kvs.random = Math.random();

                this.toHref(kvs);
            },
            pageChange(e) {
                let kvs = this.$clone(this.$route.query);
                kvs.pageNo = e;
                kvs.pageSize = this.pageSize;

                this.toHref(kvs);
            },
            toHref(query) {
                this.$router.replace({path: this.$route.path, query});
            },
            onload() {
                let {
                    membername,
                    mobile,
                    companyname,
                    membergroup,
                    disable,
                    membertype,
                    registerDateStart,
                    registerDateEnd,
                    pageNo = "1",
                    pageSize = "12"
                } = this.$clone(this.$route.query);

                this.membername = membername;
                this.mobile = mobile;
                this.companyname = companyname;
                this.membergroup = membergroup;
                this.disable = disable;
                this.membertype = membertype;
                this.registerDateStart = registerDateStart;
                this.registerDateEnd = registerDateEnd;

                this.pageNo = parseInt(pageNo);
                this.pageSize = parseInt(pageSize);

                this.$http
                    .get("/members", {
                        params: {
                            membername,
                            mobile,
                            companyname,
                            membergroup,
                            disable,
                            membertype,
                            registerDateStart,
                            registerDateEnd,
                            pageNo,
                            pageSize
                        }
                    })
                    .then(members => {
                        let {records = [], total = 0, size = 12, current = 1} = this.$success(members).data || {};
                        this.total = total;
                        this.pageSize = size;
                        this.pageNo = current;
                        this.records = records;
                    })
                    .catch(() => {});
            },
            command(methodName) {
                if (this.loading) {
                    return;
                }
                this[methodName] && this[methodName]();
            },
            query() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要查看的条目喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时查看一条喔！"});
                }
                let {memberid: memberId} = this.selections[0];
                this.memberId = memberId;
                this.model = "query";
                this.visible = true;
            },
            add() {
                this.model = "add";
                this.visible = false;
                this.$store
                    .dispatch("getAuthority", "member-add")
                    .then(ret => this.$router.replace(ret.uri))
                    .catch(() => this.$notify.error("没有相应权限！"));
            },
            modify() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要修改的条数喔！"});
                }
                if (this.selections.length > 1) {
                    return this.$notify.error({title: "错误", message: "只能同时修改一条喔！"});
                }
                this.model = "modify";
                this.visible = false;
                let {memberid: memberId} = this.selections[0];
                this.$store
                    .dispatch("getAuthority", "member-update")
                    .then(ret => this.$router.replace(ret.uri + "?memberId=" + memberId))
                    .catch(() => this.$notify.error("没有相应权限！"));
            },
            remove() {
                if (this.selections.length < 1) {
                    return this.$notify.error({title: "错误", message: "请选择要删除的条数喔！"});
                }
                this.loading = true;
                let urls = this.selections.map(i => this.$http.delete("/members/" + i.memberid));
                Promise.all(urls)
                    .then(results => {
                        let requests = results.map(v => this.$success(v));
                        let count = requests.filter(f => f.status).length;
                        if (count > 0) {
                            let message =
                                count === results.length
                                    ? "全部删除成功"
                                    : `成功：${count}，失败：${results.length - count}!`;
                            this.$notify.success({title: "成功", message});
                            return setTimeout(this.search, 1500);
                        }
                        this.$notify.error({title: "错误", message: requests[0].msg || "网络繁忙，请稍候再试！"});
                    })
                    .catch(() => this.$notify.error({title: "错误", message: "网络繁忙，请稍候再试！"}))
                    .finally(() => (this.loading = false));
            },
            selectionChange(e) {
                this.selections = e;
            },
            cancel() {
                this.visible = false;
            }
        },
        watch: {
            $route: {
                handler: function () {
                    if (this.leaving) {
                        return;
                    }
                    this.onload();
                },
                deep: true
            }
        },
        activated() {
            this.leaving = false;
        },
        deactivated() {
            this.leaving = true;
        },
        created() {
            this.onload();
        },
        components: {
            MemberForm,
            MemberGroup,
            MemberState,
            MemberType,
            "el-input": Input,
            "el-button-group": ButtonGroup,
            "el-button": Button,
            "el-table": Table,
            "el-table-column": TableColumn,
            "el-dialog": Dialog,
            "el-pagination": Pagination,
            "el-date-picker": DatePicker,
            "el-dropdown": Dropdown,
            "el-dropdown-menu": DropdownMenu,
            "el-dropdown-item": DropdownItem
        }
    };
</script>

<style lang="scss">
    .member-query {
        position: relative;
        min-height: 100%;
        background-color: #fff;
        padding: 10px;

        &-search {
            padding-bottom: 20px;
            display: flex;
            flex-wrap: wrap;

            & > div {
                width: auto;
                margin-top: 10px;
                margin-right: 20px;
            }

            &-gap {
                flex: 1;
            }
        }

        .el-pagination {
            text-align: center;
            margin-top: 20px;
            margin-bottom: 10px;
        }

        .el-dialog {
            height: 80vh;
            overflow: hidden;
            display: flex;
            flex-direction: column;

            &__header {
                flex-shrink: 0;
            }

            &__body {
                padding: 10px;
                flex: 1;
                overflow: hidden;
            }
        }

        .member-form {
            width: 100%;
            height: 100%;
            padding: 10px;
            overflow-y: auto;
            overflow-scrolling: touch;
            -webkit-overflow-scrolling: touch;
        }
    }
</style>
```
#### 双列表单
```vue
<template>
    <el-form class="member-form" ref="form" :rules="rules" :model="form" label-width="120px">
        <el-form-item v-if="readonly" label="会员编号" prop="memberaccount">
            {{ form.memberaccount }}
        </el-form-item>
        <el-form-item required label="会员名称" prop="membername">
            <el-input clearable v-model="form.membername" placeholder="请输入名称" show-word-limit maxlength="20" />
        </el-form-item>
        <el-form-item :required="passwordRequired" label="会员密码" prop="memberpwd">
            <el-input v-model="form.memberpwd" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="联系人" prop="membercontact">
            <el-input
                clearable
                v-model="form.membercontact"
                placeholder="请输入联系人"
                show-word-limit
                maxlength="20"
            />
        </el-form-item>
        <el-form-item required label="会员新类型" prop="membergroup">
            <MemberGroup v-model="form.membergroup" />
        </el-form-item>
        <el-form-item required label="会员状态" prop="disable">
            <MemberState v-model="form.disable" />
        </el-form-item>
        <el-form-item required label="会员旧类型" prop="membertype">
            <MemberType v-model="form.membertype" />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyname">
            <el-input clearable v-model="form.companyname" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="公司简称" prop="companyshort">
            <el-input clearable v-model="form.companyshort" placeholder="请输入公司简称" />
        </el-form-item>
        <el-form-item label="公司介绍" prop="companyintro">
            <el-input clearable type="textarea" v-model="form.companyintro" placeholder="请输入公司介绍" />
        </el-form-item>
        <el-form-item label="公司头像" prop="companyimg">
            <AvatarUpload v-model="form.companyimg" />
        </el-form-item>
        <el-form-item label="会员邮箱" prop="email">
            <el-input clearable v-model="form.email" placeholder="请输入会员邮箱" />
        </el-form-item>
        <el-form-item label="会员电话" prop="tel">
            <el-input clearable v-model="form.tel" placeholder="请输入会员电话" />
        </el-form-item>
        <el-form-item required label="会员手机" prop="mobile">
            <el-input clearable v-model="form.mobile" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="地址区域">
            <AreaPicker v-model="provinceCityArea" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
            <el-input type="textarea" v-model="form.address" />
        </el-form-item>
        <el-form-item label="邮政编码" prop="postcode">
            <el-input clearable v-model="form.postcode" placeholder="请输入邮政编码" />
        </el-form-item>
        <el-form-item label="会员卡号" prop="membercard">
            <el-input clearable v-model="form.membercard" placeholder="请输入会员卡号" />
        </el-form-item>
        <el-form-item required label="出生日期" prop="borningTime">
            <el-date-picker v-model="form.borningTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择日期" />
        </el-form-item>
        <el-form-item required label="会员性别" prop="sex">
            <MemberSex v-model="form.sex" />
        </el-form-item>
        <el-form-item label="QQ" prop="qq">
            <el-input v-model="form.qq" placeholder="请输入QQ" />
        </el-form-item>
        <el-form-item label="会员嗜好" prop="bparam2">
            <el-input type="textarea" v-model="form.bparam2" />
        </el-form-item>
        <el-form-item size="large" v-if="!readonly">
            <el-button type="primary" @click="submit" :loading="loading">立即保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    import {Form, FormItem, Input, DatePicker, Button} from "element-ui";
    import {isUndefined, isEmptyObject, diff} from "@/utils";
    import MemberSex from "@/views/member/MemberSex";
    import MemberGroup from "@/views/member/MemberGroup";
    import MemberState from "@/views/member/MemberState";
    import MemberType from "@/views/member/MemberType";
    import AvatarUpload from "@/components/AvatarUpload";
    import AreaPicker from "@/components/AreaPicker";

    export default {
        name: "MemberForm",
        props: {
            memberId: Number,
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                source: undefined,
                form: this.defaultForm(),
                rules: {
                    membername: [
                        {required: true, message: "请输入会员名", trigger: "blur"},
                        {min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur"}
                    ],
                    memberpwd: [
                        {
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyPassword(value);
                                switch (this.model) {
                                    case "add":
                                        if (status) {
                                            return callback();
                                        }
                                        return callback(new Error(msg));
                                    case "modify":
                                        if ((value || "").length < 1) {
                                            return callback();
                                        }
                                        return callback(new Error(msg));
                                }
                            },
                            trigger: "blur"
                        }
                    ],
                    membergroup: [{required: true, message: "请选择会员新类型", trigger: "change"}],
                    disable: [{required: true, message: "请选择会员状态", trigger: "change"}],
                    membertype: [{required: true, message: "请选择会员旧类型", trigger: "change"}],
                    email: [
                        {
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyEmail(value);
                                if ((value || "").length < 1 || status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    mobile: [
                        {required: true, message: "请输入手机号", trigger: "blur"},
                        {
                            required: true,
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyMobile(value);
                                if (status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    borningTime: [{required: true, message: "请选择出生日期", trigger: "blur"}],
                    sex: [{required: true, message: "请选择性别", trigger: "blur"}]
                },
                loading: false
            };
        },
        computed: {
            passwordRequired() {
                return isUndefined(this.source);
            },
            provinceCityArea: {
                set(values) {
                    this.form.province = values[0];
                    this.form.city = values[1];
                    this.form.area = values[2];
                },
                get() {
                    let {province, city, area} = this.form;
                    return province && city && area ? [province, city, area] : [];
                }
            },
            model() {
                if (this.readonly) {
                    return "";
                }
                return this.source?.memberid ? "modify" : "add";
            }
        },
        watch: {
            memberId(v) {
                v && this.onload(v);
            }
        },
        methods: {
            submit() {
                this.$refs.form.validate(valid => valid && this.request());
            },
            request() {
                if (this.loading) {
                    return;
                }

                // 修改检查
                let diffForm = diff(this.source, this.form);
                if (isEmptyObject(diffForm)) {
                    return this.$notify.error("没有可提交的内容~");
                }

                // 获取请求
                let {memberid: memberId} = this.source ?? {};
                let method = memberId
                    ? () => this.$http.put("/members/" + memberId, diffForm)
                    : () => this.$http.post("/members", diffForm);

                // 执行请求
                this.loading = true;
                method()
                    .then(ret => {
                        const {status, msg} = this.$success(ret);
                        if (status) {
                            this.$notify.success("保存成功");
                            this.$store
                                .dispatch("getAuthority", "member-query")
                                .then(ret => this.$router.replace(ret.uri))
                                .catch(() => this.$notify.error("没有相应权限！"));
                            return;
                        }
                        this.$notify.error(msg || "保存失败");
                    })
                    .catch(() => this.$notify.error("保存失败，请检查表单！"))
                    .finally(() => (this.loading = false));
            },
            onload(memberId) {
                this.$http
                    .get("/members/" + memberId)
                    .then(ret => {
                        let {data} = this.$success(ret);

                        if (data) {
                            this.form = this.$clone(data);
                            this.source = data;
                            return;
                        }
                        this.source = undefined;
                        this.form = this.defaultForm();
                    })
                    .catch(() => {});
            },
            defaultForm() {
                return {
                    membername: "",
                    memberpwd: "",
                    membercontact: "",
                    membergroup: "",
                    grade: 31,
                    disable: "0",
                    membertype: "",

                    companyname: "",
                    companyshort: "",
                    companyintro: "",
                    companyimg: "",

                    email: "",
                    tel: "",

                    province: "",
                    city: "",
                    area: "",
                    mobile: "",
                    address: "",
                    postcode: "",

                    membercard: "",
                    borningTime: "",

                    sex: "",
                    qq: "",
                    bparam2: ""
                };
            }
        },
        created() {
            let memberId = this.memberId || this.$route.query.memberId;
            memberId && this.onload(memberId);
        },
        components: {
            AreaPicker,
            AvatarUpload,
            MemberType,
            MemberState,
            MemberGroup,
            MemberSex,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-date-picker": DatePicker,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .member-form {
        padding: 40px;
        min-height: 100%;
        background-color: #fff;
        position: relative;
        display: flex;
        align-items: flex-start;
        flex-wrap: wrap;
        justify-content: flex-start;
        align-content: flex-start;
        width: 100%;

        .el-form-item:nth-of-type(even) {
            margin-left: auto;
            margin-right: auto;
        }

        .el-form-item {
            flex-basis: 44%;

            &--large {
                margin-top: 22px;
            }
        }
    }
</style>
```
#### 单列表单
```vue
<template>
    <el-form class="member-form" ref="form" :rules="rules" :model="form" label-width="120px">
        <el-form-item v-if="readonly" label="会员编号" prop="memberaccount">
            {{ form.memberaccount }}
        </el-form-item>
        <el-form-item required label="会员名称" prop="membername">
            <el-input clearable v-model="form.membername" placeholder="请输入名称" show-word-limit maxlength="20" />
        </el-form-item>
        <el-form-item :required="passwordRequired" label="会员密码" prop="memberpwd">
            <el-input v-model="form.memberpwd" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="联系人" prop="membercontact">
            <el-input
                clearable
                v-model="form.membercontact"
                placeholder="请输入联系人"
                show-word-limit
                maxlength="20"
            />
        </el-form-item>
        <el-form-item required label="会员新类型" prop="membergroup">
            <MemberGroup v-model="form.membergroup" />
        </el-form-item>
        <el-form-item required label="会员状态" prop="disable">
            <MemberState v-model="form.disable" />
        </el-form-item>
        <el-form-item required label="会员旧类型" prop="membertype">
            <MemberType v-model="form.membertype" />
        </el-form-item>
        <el-form-item label="公司名称" prop="companyname">
            <el-input clearable v-model="form.companyname" placeholder="请输入公司名称" />
        </el-form-item>
        <el-form-item label="公司简称" prop="companyshort">
            <el-input clearable v-model="form.companyshort" placeholder="请输入公司简称" />
        </el-form-item>
        <el-form-item label="公司介绍" prop="companyintro">
            <el-input clearable type="textarea" v-model="form.companyintro" placeholder="请输入公司介绍" />
        </el-form-item>
        <el-form-item label="公司头像" prop="companyimg">
            <AvatarUpload v-model="form.companyimg" />
        </el-form-item>
        <el-form-item label="会员邮箱" prop="email">
            <el-input clearable v-model="form.email" placeholder="请输入会员邮箱" />
        </el-form-item>
        <el-form-item label="会员电话" prop="tel">
            <el-input clearable v-model="form.tel" placeholder="请输入会员电话" />
        </el-form-item>
        <el-form-item required label="会员手机" prop="mobile">
            <el-input clearable v-model="form.mobile" placeholder="请输入手机号码" />
        </el-form-item>
        <el-form-item label="地址区域">
            <AreaPicker v-model="provinceCityArea" />
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
            <el-input type="textarea" v-model="form.address" />
        </el-form-item>
        <el-form-item label="邮政编码" prop="postcode">
            <el-input clearable v-model="form.postcode" placeholder="请输入邮政编码" />
        </el-form-item>
        <el-form-item label="会员卡号" prop="membercard">
            <el-input clearable v-model="form.membercard" placeholder="请输入会员卡号" />
        </el-form-item>
        <el-form-item required label="出生日期" prop="borningTime">
            <el-date-picker v-model="form.borningTime" type="date" value-format="yyyy-MM-dd" placeholder="请选择日期" />
        </el-form-item>
        <el-form-item required label="会员性别" prop="sex">
            <MemberSex v-model="form.sex" />
        </el-form-item>
        <el-form-item label="QQ" prop="qq">
            <el-input v-model="form.qq" placeholder="请输入QQ" />
        </el-form-item>
        <el-form-item label="会员嗜好" prop="bparam2">
            <el-input type="textarea" v-model="form.bparam2" />
        </el-form-item>
        <el-form-item size="large" v-if="!readonly">
            <el-button type="primary" @click="submit" :loading="loading">立即保存</el-button>
        </el-form-item>
    </el-form>
</template>

<script>
    import {Form, FormItem, Input, DatePicker, Button} from "element-ui";
    import {isUndefined, isEmptyObject, diff} from "@/utils";
    import MemberSex from "@/views/member/MemberSex";
    import MemberGroup from "@/views/member/MemberGroup";
    import MemberState from "@/views/member/MemberState";
    import MemberType from "@/views/member/MemberType";
    import AvatarUpload from "@/components/AvatarUpload";
    import AreaPicker from "@/components/AreaPicker";

    export default {
        name: "MemberForm",
        props: {
            memberId: Number,
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                source: undefined,
                form: this.defaultForm(),
                rules: {
                    membername: [
                        {required: true, message: "请输入会员名", trigger: "blur"},
                        {min: 3, max: 20, message: "长度在 3 到 20 个字符", trigger: "blur"}
                    ],
                    memberpwd: [
                        {
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyPassword(value);
                                switch (this.model) {
                                    case "add":
                                        if (status) {
                                            return callback();
                                        }
                                        return callback(new Error(msg));
                                    case "modify":
                                        if ((value || "").length < 1) {
                                            return callback();
                                        }
                                        return callback(new Error(msg));
                                }
                            },
                            trigger: "blur"
                        }
                    ],
                    membergroup: [{required: true, message: "请选择会员新类型", trigger: "change"}],
                    disable: [{required: true, message: "请选择会员状态", trigger: "change"}],
                    membertype: [{required: true, message: "请选择会员旧类型", trigger: "change"}],
                    email: [
                        {
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyEmail(value);
                                if ((value || "").length < 1 || status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    mobile: [
                        {required: true, message: "请输入手机号", trigger: "blur"},
                        {
                            required: true,
                            validator: (rule, value, callback) => {
                                let {status, msg} = this.$verifyMobile(value);
                                if (status) {
                                    return callback();
                                }
                                callback(new Error(msg));
                            },
                            trigger: "blur"
                        }
                    ],
                    borningTime: [{required: true, message: "请选择出生日期", trigger: "blur"}],
                    sex: [{required: true, message: "请选择性别", trigger: "blur"}]
                },
                loading: false
            };
        },
        computed: {
            passwordRequired() {
                return isUndefined(this.source);
            },
            provinceCityArea: {
                set(values) {
                    this.form.province = values[0];
                    this.form.city = values[1];
                    this.form.area = values[2];
                },
                get() {
                    let {province, city, area} = this.form;
                    return province && city && area ? [province, city, area] : [];
                }
            },
            model() {
                if (this.readonly) {
                    return "";
                }
                return this.source?.memberid ? "modify" : "add";
            }
        },
        watch: {
            memberId(v) {
                v && this.onload(v);
            }
        },
        methods: {
            submit() {
                this.$refs.form.validate(valid => valid && this.request());
            },
            request() {
                if (this.loading) {
                    return;
                }

                // 修改检查
                let diffForm = diff(this.source, this.form);
                if (isEmptyObject(diffForm)) {
                    return this.$notify.error("没有可提交的内容~");
                }

                // 获取请求
                let {memberid: memberId} = this.source ?? {};
                let method = memberId
                    ? () => this.$http.put("/members/" + memberId, diffForm)
                    : () => this.$http.post("/members", diffForm);

                // 执行请求
                this.loading = true;
                method()
                    .then(ret => {
                        const {status, msg} = this.$success(ret);
                        if (status) {
                            this.$notify.success("保存成功");
                            this.$store
                                .dispatch("getAuthority", "member-query")
                                .then(ret => this.$router.replace(ret.uri))
                                .catch(() => this.$notify.error("没有相应权限！"));
                            return;
                        }
                        this.$notify.error(msg || "保存失败");
                    })
                    .catch(() => this.$notify.error("保存失败，请检查表单！"))
                    .finally(() => (this.loading = false));
            },
            onload(memberId) {
                this.$http
                    .get("/members/" + memberId)
                    .then(ret => {
                        let {data} = this.$success(ret);

                        if (data) {
                            this.form = this.$clone(data);
                            this.source = data;
                            return;
                        }
                        this.source = undefined;
                        this.form = this.defaultForm();
                    })
                    .catch(() => {});
            },
            defaultForm() {
                return {
                    membername: "",
                    memberpwd: "",
                    membercontact: "",
                    membergroup: "",
                    grade: 31,
                    disable: "0",
                    membertype: "",

                    companyname: "",
                    companyshort: "",
                    companyintro: "",
                    companyimg: "",

                    email: "",
                    tel: "",

                    province: "",
                    city: "",
                    area: "",
                    mobile: "",
                    address: "",
                    postcode: "",

                    membercard: "",
                    borningTime: "",

                    sex: "",
                    qq: "",
                    bparam2: ""
                };
            }
        },
        created() {
            let memberId = this.memberId || this.$route.query.memberId;
            memberId && this.onload(memberId);
        },
        components: {
            AreaPicker,
            AvatarUpload,
            MemberType,
            MemberState,
            MemberGroup,
            MemberSex,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-date-picker": DatePicker,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .member-form {
        padding: 40px;
        min-height: 100%;
        background-color: #fff;
        position: relative;
        width: 100%;
    }
</style>
```
### 图表插件
图片使用示例，详细文档请参考 `https://echarts.apache.org/` 。

```vue
<template>
    <Charts
        ref="chats"
        :option="{
            title: {
                text: 'ECharts 入门示例',
                x: 'center',
                y: '10px'
            },
            xAxis: {
                data: ['衬衫', '羊毛衫', '雪纺衫', '裤子', '高跟鞋', '袜子']
            },
            yAxis: {},
            series: [
                {
                    name: '销量',
                    type: 'bar',
                    data: [5, 20, 36, 10, 10, 20]
                }
            ]
        }"
        @click="a"
    />
</template>

<script>
    import Charts from "@/components/Charts";
    export default {
        name: "Test",
        components: {Charts},
        methods: {
            a(e) {
                console.log(e);
            }
        }
    };
</script>
```
