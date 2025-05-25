<template>
    <div class="work-initiate-form">
        <div class="work-initiate-form-bpmn" ref="bpmn"></div>
        <vue-form
            ref="form"
            v-model="form"
            :schema="schema"
            :ui-schema="uiSchema"
            :form-props="formProps"
            :form-footer="formFooter"
        />
        <div class="work-initiate-form-bottom">
            <el-button :loading="loading" @click="prev">上一步</el-button>
            <el-button :loading="loading" type="primary" @click="check">提 交</el-button>
        </div>
        <WorkInitiateAssignee v-model="dialog" :parameters="userTask" @join="join" />
    </div>
</template>

<script>
    import {Button} from "element-ui";
    import NavigatedViewer from "bpmn-js/lib/NavigatedViewer";
    import ModelingModule from "bpmn-js/lib/features/modeling";
    import CamundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
    import CustomModdleDescriptor from "@/assets/bpmn-js/CustomModdleDescriptor";
    import WorkInitiateAssignee from "@/views/work/initiate/WorkInitiateAssignee.vue";

    export default {
        name: "WorkInitiateForm",
        props: {
            definitionKey: {type: String, required: true}
        },
        data() {
            return {
                bpmnViewer: undefined,

                form: {},
                schema: {},
                uiSchema: {},
                formProps: {},
                formFooter: {show: false},

                chooseKey: "",
                userTasks: [],
                dialog: false,
                loading: false
            };
        },
        computed: {
            userTask() {
                return this.userTasks.find(f => f.id === this.chooseKey);
            }
        },
        watch: {
            async definitionKey() {
                await this.onload();
            }
        },
        methods: {
            zoom() {
                let canvas = this.bpmnViewer.get("canvas");
                if (canvas) {
                    canvas.zoom("fit-viewport", true);
                }
            },
            async elements() {
                let elementRegistry = this.bpmnViewer.get("elementRegistry");
                this.userTasks = elementRegistry.filter(f => f.type === "bpmn:UserTask").map(this.reader);
                for (let userTask of this.userTasks) {
                    if (userTask.value) {
                        let search = userTask.value.replace(/-/g, "=").replace(/ *, */g, "&");
                        try {
                            let response = await this.$http.get("/flows/assignees/render?" + search);
                            userTask.value = response.data ?? [];
                            this.writeBack(userTask, {fill: undefined, stroke: undefined});
                        } catch (e) {
                            userTask.value = [];
                        }
                    } else {
                        userTask.value = [];
                        this.writeBack(userTask, {fill: undefined, stroke: "#E6A23C"});
                    }
                }
            },
            writeBack({element, name, value}, colors) {
                let modeling = this.bpmnViewer.get("modeling");
                let label = name + "\n" + (value.length ? value.map(m => m.name).join(", ") : "请点击选择");
                modeling.updateLabel(element, label);
                modeling.setColor([element], colors);
            },
            waken({element}) {
                if (element?.type === "bpmn:UserTask") {
                    let businessObject = element.businessObject ?? element;
                    this.chooseKey = businessObject.get("id");
                    this.$nextTick(() => {
                        if (this.userTask?.isOptional) {
                            this.dialog = true;
                        }
                    });
                }
            },
            join(values) {
                let {isOptional, isMultiple} = this.userTask;
                if (!isOptional) {
                    return;
                }
                if (!isMultiple && values.length > 1) {
                    this.$notify.error({title: "错误", message: "该任务的审批人是单选的喔~"});
                    return;
                }
                this.userTask.value = values;
                let stroke = values.length ? undefined : "#E6A23C";
                this.writeBack(this.userTask, {fill: undefined, stroke});
            },
            reader(element) {
                let businessObject = element.businessObject ?? element;
                let id = businessObject.get("id");
                let name = businessObject.get("name");

                let optionalValue = businessObject.get("custom:assigneeOptional");
                let isOptional = optionalValue === true || optionalValue === "true";

                let multipleValue = businessObject.get("custom:assigneeMultiple");
                let isMultiple = multipleValue === true || multipleValue === "true";

                let contentValue = businessObject.get("custom:assigneeContent");
                let condition = isOptional ? contentValue : undefined;
                let value = isOptional ? undefined : contentValue;

                let loopCharacteristics = businessObject.loopCharacteristics;
                let expression = loopCharacteristics
                    ? loopCharacteristics.get("camunda:collection")
                    : isMultiple
                    ? businessObject.get("camunda:candidateUsers")
                    : businessObject.get("camunda:assignee");
                let key = expression.replace(/(\$\{|})/g, "");

                return {element, id, name, key, isOptional, isMultiple, condition, value};
            },
            async onload() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                try {
                    let response = await this.$http.get("/works/initiates/" + this.definitionKey);
                    this.bpmnViewer = new NavigatedViewer({
                        additionalModules: [ModelingModule],
                        moddleExtensions: {
                            camunda: CamundaModdleDescriptors,
                            custom: CustomModdleDescriptor
                        },
                        container: this.$refs.bpmn
                    });
                    this.bpmnViewer.on("element.click", this.waken);
                    this.bpmnViewer
                        .importXML(response.data)
                        .then(async () => {
                            this.zoom();
                            await this.elements();
                        })
                        .catch(() => {});
                    // eslint-disable-next-line no-empty
                } catch (ignored) {}

                try {
                    let response = await this.$http.get("/works/initiates/" + this.definitionKey + "/form");
                    this.former(response.data);
                } catch (ignored) {
                    this.former({});
                }

                this.loading = false;
            },
            former({schema = {}, uiSchema = {}, formProps = {}, formFooter = {show: false}}) {
                this.schema = schema;
                this.uiSchema = uiSchema;
                this.formProps = formProps;
                this.formFooter = formFooter;
                this.form = {};
            },
            prev() {
                this.$emit("prev");
            },
            check() {
                let assigneeVariables = {};
                for (let userTask of this.userTasks) {
                    if (userTask.value.length < 1) {
                        this.$notify.error({title: "错误", message: "请检查审批人选择！"});
                        this.$refs.bpmn.scrollIntoView(true);
                        this.zoom();
                        return;
                    }
                    let ids = userTask.value.map(v => v.id).map(String);
                    assigneeVariables[userTask.key] = userTask.isMultiple ? ids : ids[0];
                }

                this.$refs.form.$refs.genEditForm.validate(isValid => {
                    if (isValid) {
                        let form = Object.assign({}, assigneeVariables, this.form);
                        this.submit(form);
                        return;
                    }
                    this.$notify.error({title: "错误", message: "请检查表单的填写！"});
                });
            },
            submit(form) {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                this.$http
                    .post("/works/initiates/" + this.definitionKey + "?notify=", form, {
                        headers: {"Content-Type": this.$consts.MEDIA_TYPE.APPLICATION_JSON}
                    })
                    .then(() => {
                        this.$notify.success({title: "成功", message: "您的流程启动成功~"});
                        this.$closeView(this.$route);
                        this.$router.push({name: "work-own"});
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            }
        },
        mounted() {
            this.$nextTick(this.onload);
        },
        components: {
            WorkInitiateAssignee,
            "el-button": Button
        }
    };
</script>

<style src="bpmn-js/dist/assets/diagram-js.css" />
<style src="bpmn-js/dist/assets/bpmn-js.css" />
<style src="bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css" />

<style lang="scss">
    .work-initiate-form {
        position: relative;
        padding: 20px;
        background-color: #fff;
        min-height: 100%;

        .bjs-powered-by {
            display: none;
        }

        .fjs-powered-by {
            display: none;
        }

        &-bpmn {
            flex-shrink: 0;
            height: 40vh;
            border: 1px solid $border-base;
            border-radius: $border-radius-base;
            margin-bottom: 20px;
        }

        &-render {
            position: relative;

            .cds--grid {
                padding-right: 0;
                padding-left: 0;
                max-width: 100%;
            }
        }

        &-bottom {
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
        }
    }
</style>
