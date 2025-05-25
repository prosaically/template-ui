<template>
    <el-form class="system-notice-form" ref="form" :rules="baseRules" :model="form" label-width="85px">
        <el-form-item label="通知 ID" prop="id" v-if="readonly">
            {{ form.id }}
        </el-form-item>
        <el-form-item label="通知标题" prop="title">
            <el-input v-model="form.title" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="通知类型" prop="type">
            <NoticeTopicType v-model="form.type" />
        </el-form-item>
        <el-form-item label="发布人员" prop="senderName" v-if="readonly">
            {{ form.senderName }}
        </el-form-item>
        <el-form-item label="通知状态" prop="status">
            <el-switch v-model="form.status" />
        </el-form-item>
        <el-form-item label="通知内容" prop="content" size="large">
            <RichTextEditor v-model="form.content" :readonly="readonly" />
        </el-form-item>
        <el-form-item label="通知范围" prop="takers" size="large">
            <div class="system-notice-form-takers">
                <div class="system-notice-form-takers-cell">#</div>
                <div class="system-notice-form-takers-cell">类型</div>
                <div class="system-notice-form-takers-cell">范围</div>
                <div class="system-notice-form-takers-cell">
                    <el-button size="mini" @click="evoke">增加</el-button>
                </div>

                <template v-for="(taker, index) in form.takers">
                    <div class="system-notice-form-takers-cell" :key="100 + index">{{ index + 1 }}</div>
                    <div class="system-notice-form-takers-cell" :key="200 + index" v-text="taker.typeEnum.desc"></div>
                    <div class="system-notice-form-takers-cell" :key="300 + index">
                        {{ taker.takerName || "点击选择范围~" }}
                    </div>
                    <div class="system-notice-form-takers-cell" :key="400 + index">
                        <el-button type="danger" size="mini" @click="remove(index)">删除</el-button>
                    </div>
                </template>

                <div class="system-notice-form-takers-empty" v-if="form.takers.length < 1">请增加通知范围~</div>
            </div>
        </el-form-item>
        <el-form-item label="通知人数" prop="takerTotal" v-if="readonly">
            {{ form.takerTotal }}
        </el-form-item>
        <el-form-item label="已读人数" prop="takerReads" v-if="readonly">
            {{ form.takerReads }}
        </el-form-item>
        <el-form-item label="修改时间" prop="latest" v-if="readonly">
            {{ form.latest }}
        </el-form-item>
        <el-form-item label="创建时间" prop="inTime" v-if="readonly">
            {{ form.inTime }}
        </el-form-item>
        <el-form-item size="large" v-if="!readonly">
            <el-button type="primary" @click="submit" :loading="loading">立即保存</el-button>
        </el-form-item>

        <SystemNoticePicker v-model="picker" @confirm="add" />
    </el-form>
</template>

<script>
    import {Form, FormItem, Input, Switch, Button} from "element-ui";
    import RichTextEditor from "@/components/RichTextEditor";
    import {isEmptyObject, diff} from "@/utils";
    import NoticeTopicType from "@/views/system/notice/NoticeTopicType.vue";
    import SystemNoticePicker from "@/views/system/notice/SystemNoticePicker.vue";

    export default {
        name: "SystemNoticeForm",
        props: {
            id: [Number, String],
            readonly: {
                type: Boolean,
                default: false
            }
        },
        data() {
            return {
                source: undefined,
                form: this.defaultForm(),
                baseRules: {
                    title: [
                        {required: true, message: "请输入通知标题", trigger: "blur"},
                        {min: 2, message: "长度在 2 个字符以上", trigger: "blur"}
                    ],
                    type: [{required: true, message: "请选择通知类型", trigger: "blur"}],
                    status: [{required: true, message: "请选择通知状态", trigger: "blur"}],
                    content: [
                        {required: true, message: "请输入通知内容", trigger: "change"},
                        {min: 5, message: "长度在 5 个字符以上", trigger: "change"}
                    ],
                    takers: [
                        {required: true, message: "请输入通知范围", trigger: "change"},
                        {
                            validator: (rule, value, callback) => {
                                if ((value ?? []).length < 1) {
                                    return callback(new Error("通知范围条目不能少于 1"));
                                }
                                callback();
                            },
                            trigger: "change"
                        }
                    ]
                },
                picker: false,
                loading: false
            };
        },
        watch: {
            id() {
                this.onload();
            }
        },
        methods: {
            evoke() {
                this.picker = true;
            },
            add(takers) {
                this.form.takers.push(...takers);
            },
            remove(index) {
                this.form.takers.splice(index, 1);
            },
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
                let {id} = this.source || {};
                let config = {headers: {"Content-Type": "application/json"}};
                let method = id
                    ? () => this.$http.put("/system/notices/" + id + "?notify=", diffForm, config)
                    : () => this.$http.post("/system/notices?notify=", diffForm, config);

                // 执行请求
                this.loading = true;
                method()
                    .then(() => {
                        this.$notify.success({title: "成功", message: "保存成功~"});
                        this.$store
                            .dispatch("getAuthority", "system-notice")
                            .then(ret => this.$closeView(this.$route, ret))
                            .then(ret => this.$router.replace(ret.uri))
                            .catch(() => this.$notify.error("没有相应权限！"));
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            },
            onload() {
                if (this.id === undefined || this.id === null || this.id === "") {
                    this.source = undefined;
                    this.form = this.defaultForm();
                    return;
                }
                this.$http
                    .get("/system/notices/" + this.id + "?notify=")
                    .then(response => {
                        if (response.data) {
                            this.form = this.$clone(response.data);
                            this.source = response.data;
                            return;
                        }
                        this.source = undefined;
                        this.form = this.defaultForm();
                    })
                    .catch(() => {});
            },
            defaultForm() {
                return {
                    id: undefined,
                    title: "",
                    content: "",
                    type: "",
                    status: true,
                    latest: undefined,
                    inTime: undefined,
                    senderName: undefined,
                    takerTotal: undefined,
                    takerReads: undefined,
                    takers: []
                };
            }
        },
        created() {
            this.onload();
        },
        components: {
            SystemNoticePicker,
            NoticeTopicType,
            RichTextEditor,
            "el-form": Form,
            "el-form-item": FormItem,
            "el-input": Input,
            "el-switch": Switch,
            "el-button": Button
        }
    };
</script>

<style lang="scss">
    .system-notice-form {
        width: 100%;
        min-height: 100%;
        padding: 22px;
        background-color: #fff;
        position: relative;
        display: grid;
        grid-column-gap: 22px;
        grid-template-columns: auto auto;
        grid-auto-rows: auto;

        .el-form-item--large {
            grid-column: span 2;
        }

        .el-table__cell:nth-child(3) {
            cursor: pointer;
        }

        &-takers {
            display: grid;
            grid-template-columns: 60px 260px auto 160px;
            grid-auto-rows: auto;
            grid-gap: 1px;
            background-color: $border-base;
            padding: 1px;

            &-cell {
                padding: 5px 10px;
                background-color: #fff;
            }

            &-empty {
                grid-column: span 4;
                text-align: center;
                background-color: #fff;
            }
        }
    }
</style>
