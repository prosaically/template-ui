import {Table, TableColumn, Button} from "element-ui";
import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
import ModelingModule from "bpmn-js/lib/features/modeling";
import CamundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
import CustomModdleDescriptor from "@/assets/bpmn-js/CustomModdleDescriptor.json";
import {diff, isEmptyObject} from "@/utils";

export default {
    model: {
        prop: "value",
        event: "input"
    },
    props: {
        value: {type: Boolean, default: false}
    },
    data() {
        return {
            bpmnViewer: undefined,

            form: {},
            schema: {},
            formProps: {},
            formFooter: {show: false},

            processInstance: undefined,
            activities: undefined,
            assignees: undefined,
            comments: undefined,

            loading: false
        };
    },
    computed: {
        uri() {
            return undefined;
        },
        visible: {
            set(value) {
                this.$emit("input", value);
            },
            get() {
                return this.value;
            }
        },
        readonly() {
            return false;
        },
        isLoading() {
            if (this.processInstance) {
                return false;
            }
            return this.loading;
        },
        messages() {
            let map = {};
            if (this.comments) {
                this.comments.forEach(comment => (map[comment.taskId] = comment.message));
            }
            return map;
        },
        routes() {
            if (this.activities) {
                let lastIndex = this.activities.findLastIndex(value => value.canceled);
                return this.activities.slice(lastIndex < 0 ? 0 : ++lastIndex);
            }
            return [];
        },
        mapping() {
            let map = {};
            for (let activity of this.routes) {
                map[activity.activityId] = activity;
            }
            return map;
        },
        type() {
            return {
                ACTIVE: "primary",
                SUSPENDED: "warning",
                COMPLETED: "success",
                EXTERNALLY_TERMINATED: "danger",
                INTERNALLY_TERMINATED: "danger"
            }[this.processInstance?.state];
        },
        status() {
            return this.$consts.HISTORIC_PROCESS_INSTANCE[this.processInstance?.state];
        }
    },
    watch: {
        uri() {
            this.$debounce(this.onload);
        }
    },
    methods: {
        initialize(bpmn, form, variables) {
            if (this.bpmnViewer) {
                this.bpmnViewer.destroy();
            }
            this.bpmnViewer = new NavigatedViewer({
                additionalModules: [ModelingModule],
                moddleExtensions: {
                    camunda: CamundaModdleDescriptors,
                    custom: CustomModdleDescriptor
                },
                container: this.$refs.bpmn
            });
            this.bpmnViewer
                .importXML(bpmn)
                .then(this.imported)
                .catch(() => {});

            let {schema = {}, formProps = {}, formFooter = {show: false}} = form ?? {};
            this.schema = schema;
            this.formProps = formProps;
            this.formFooter = formFooter;
            this.form = variables ?? {};
        },
        imported() {
            let canvas = this.bpmnViewer.get("canvas");
            canvas.zoom("fit-viewport", true);

            const elements = {};
            let elementRegistry = this.bpmnViewer.get("elementRegistry");
            elementRegistry.forEach(element => (elements[element.id] = element));

            let modeling = this.bpmnViewer.get("modeling");
            for (let activity of this.routes) {
                let current = elements[activity.activityId];
                let color = this.color(activity);
                modeling.setColor([current], color);
                this.dyeing({elements, current, color, modeling});
            }
        },
        dyeing({elements, current, color, modeling}) {
            let incoming = current.incoming;
            if (incoming.length < 1 && current.source) {
                incoming = [current.source];
            }
            for (let element of incoming) {
                if (this.mapping[element.id]) {
                    return true;
                }
                let handle = this.dyeing({elements, current: element, color, modeling});
                if (handle) {
                    modeling.setColor([element], color);
                }
            }
        },
        color({endTime}) {
            return endTime ? {stroke: "#67C23A", fill: "#f0f9eb"} : {stroke: "#409EFF", fill: "#ecf5ff"};
        },
        onload() {
            if (this.uri === undefined) {
                this.resolve({data: {}});
                return;
            }
            if (this.loading) {
                return;
            }
            this.loading = true;
            this.$http
                .get(this.uri)
                .then(this.resolve)
                .catch(() => {})
                .finally(() => (this.loading = false));
        },
        resolve({data}) {
            let {processInstance, bpmn, activities, form, variables, assignees, comments} = data;
            this.processInstance = processInstance;
            if (activities) {
                activities = activities.filter(f => f.activityType !== "multiInstanceBody");
            }
            this.activities = activities;
            this.variables = variables;
            this.assignees = assignees;
            this.comments = comments;
            this.initialize(bpmn, form, variables);
        },
        check() {
            return this.$refs.form.$refs.genEditForm
                .validate()
                .then(() => {
                    let form = diff(this.variables, this.form);
                    if (isEmptyObject(form)) {
                        return Promise.reject("没有可以提交的内容");
                    }
                    return Promise.resolve(form);
                })
                .catch(() => Promise.reject("请检查表单的填写！"));
        },
        cancel() {
            this.$prompt("流程实例撤消后无法恢复，您确定吗？", "提示", {
                inputPattern: /.{4,}/,
                inputErrorMessage: "撤消原因不能少于4个字符",
                inputPlaceholder: "请输入撤消原因",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "close" || action === "cancel") {
                        done();
                        return;
                    }
                    instance.cancelButtonLoading = instance.confirmButtonLoading = true;
                    this.$http
                        .delete(this.uri, {data: {reason: instance.inputValue}})
                        .then(() => {
                            this.$notify.success({title: "成功", message: "您的流程实例已撤消"});
                            this.onload();
                        })
                        .catch(() => {})
                        .finally(() => {
                            instance.cancelButtonLoading = instance.confirmButtonLoading = false;
                            done();
                        });
                }
            }).catch(() => {});
        },
        update() {
            this.check()
                .then(form => {
                    this.$http
                        .patch(this.uri, form, {headers: {"Content-Type": "application/json"}})
                        .then(() => {
                            this.$notify.success({title: "成功", message: "您的流程实例已修改"});
                            setTimeout(this.onload, 3000);
                        })
                        .catch(() => {});
                })
                .catch(message => this.$notify.error({title: "错误", message}));
        },
        approve() {
            this.$prompt("您确定要审批该任务吗？", "提示", {
                distinguishCancelAndClose: true,
                inputPattern: /.{2,}/,
                inputErrorMessage: "审批意见不能为空",
                inputPlaceholder: "请输入审批意见",
                cancelButtonText: "驳回",
                confirmButtonText: "同意",
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "close") {
                        done();
                        return;
                    }
                    if (!instance.validate()) {
                        return;
                    }
                    instance.cancelButtonLoading = instance.confirmButtonLoading = true;
                    this.$http
                        .post(this.uri, {restore: action === "cancel", message: instance.inputValue})
                        .then(() => {
                            this.$notify.success({title: "成功", message: "您的任务审批已完成"});
                            if (action === "confirm") {
                                this.$store
                                    .dispatch("getAuthority", "work-complete")
                                    .then(ret => this.$closeView(this.$route, ret))
                                    .then(ret => this.$router.replace(ret.uri))
                                    .catch(() => {});
                            }
                        })
                        .catch(() => {})
                        .finally(() => {
                            instance.cancelButtonLoading = instance.confirmButtonLoading = false;
                            done();
                            this.visible = false;
                        });
                }
            }).catch(() => {});
        },
        claim() {
            this.$confirm("认领任务后无法归还，您确定吗？", "提示", {
                type: "warning",
                beforeClose: (action, instance, done) => {
                    if (action === "close" || action === "cancel") {
                        done();
                        return;
                    }
                    instance.cancelButtonLoading = instance.confirmButtonLoading = true;
                    this.$http
                        .post(this.uri)
                        .then(() => {
                            this.$notify.success({title: "成功", message: "您已经认领成功~"});
                            this.$store
                                .dispatch("getAuthority", "work-await")
                                .then(ret => this.$closeView(this.$route, ret))
                                .then(ret => this.$router.replace(ret.uri))
                                .catch(() => {});
                        })
                        .catch(() => {})
                        .finally(() => {
                            instance.cancelButtonLoading = instance.confirmButtonLoading = false;
                            done();
                        });
                }
            }).catch(() => {});
        },
        cancelable() {
            return false;
        },
        updatable() {
            return false;
        },
        approvable() {
            return false;
        },
        claimable() {
            return false;
        },
        buttons(builder) {
            return [
                {type: "warning", text: "撤消", click: this.cancel, able: this.cancelable},
                {type: "primary", text: "修改", click: this.update, able: this.updatable},
                {type: "primary", text: "审批", click: this.approve, able: this.approvable},
                {type: "primary", text: "领取", click: this.claim, able: this.claimable}
            ]
                .filter(f => f.able())
                .map(button => {
                    let {type, click, text} = button;
                    return builder("el-button", {props: {plain: true, type}, on: {click}}, text);
                });
        }
    },
    mounted() {
        this.$nextTick(this.onload);
    },
    components: {
        "el-table": Table,
        "el-table-column": TableColumn,
        "el-button": Button
    },
    render(builder, context) {
        return builder("div", {class: "process-instance", directives: [{name: "loading", value: this.isLoading}]}, [
            builder("div", {class: "process-instance-bpmn", ref: "bpmn"}),
            builder("el-table", {props: {data: this.activities, "highlight-current-row": true}}, [
                builder("el-table-column", {props: {label: "#", type: "index", width: "50"}}),
                builder("el-table-column", {props: {label: "开始时间", prop: "startTime", width: "180"}}),
                builder("el-table-column", {props: {label: "结束时间", prop: "endTime", width: "180"}}),
                builder("el-table-column", {props: {label: "任务名称", prop: "activityName"}}),
                builder("el-table-column", {
                    props: {label: "负责人", width: "120"},
                    scopedSlots: {default: ({row}) => this.assignees[row.assignee]}
                }),
                builder("el-table-column", {
                    props: {label: "处理结果", width: "100"},
                    scopedSlots: {default: ({row}) => (row.canceled ? "已驳回" : row.endTime ? "已完成" : "待办中")}
                }),
                builder("el-table-column", {
                    props: {label: "处理意见"},
                    scopedSlots: {default: ({row}) => this.messages[row.taskId]}
                })
            ]),
            builder("vue-form", {
                class: "process-instance-render",
                props: {value: this.form, schema: this.schema, formProps: this.formProps, formFooter: this.formFooter},
                on: {input: value => (this.form = value)},
                ref: "form"
            }),
            builder("div", {class: "process-instance-button"}, [
                ...this.buttons(builder, context),
                builder("el-button", {props: {type: this.type}}, this.status)
            ])
        ]);
    }
};
