<template>
    <div class="flow-bpmn-modeler">
        <div class="flow-bpmn-modeler-container" ref="container"></div>
        <div class="flow-bpmn-modeler-bts">
            <i title="打开文档" @click="open" class="el-icon-folder-opened"></i>
            <i title="新建文档" @click="built" class="el-icon-document-add"></i>
            <i title="导出文档" @click="output" class="el-icon-download"></i>
            <i title="保存文档" @click="submit" class="el-icon-check"></i>
        </div>
        <input class="flow-bpmn-modeler-file" type="file" accept=".bpmn" ref="file" @change="change" />
        <FlowBpmnAssignee
            v-model="visible"
            :optional="assigneeOptional"
            :multiple="assigneeMultiple"
            :content="assigneeContent"
            @confirm="confirm"
        />
    </div>
</template>

<script>
    import {letters} from "@/utils/randomizer.js";
    import BpmnModeler from "bpmn-js/lib/Modeler";
    import {
        BpmnPropertiesPanelModule,
        BpmnPropertiesProviderModule,
        CamundaPlatformPropertiesProviderModule
    } from "bpmn-js-properties-panel";
    import CamundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
    import CustomPropertiesProviderModule from "@/assets/bpmn-js/CustomPropertiesProviderModule.js";
    import CustomModdleDescriptor from "@/assets/bpmn-js/CustomModdleDescriptor.json";
    import ZhCnTranslate from "@/assets/bpmn-js/ZhCnTranslate.js";
    import FlowBpmnAssignee from "@/views/flow/bpmn/FlowBpmnAssignee.vue";

    export default {
        name: "FlowBpmnModeler",
        components: {FlowBpmnAssignee},
        props: {
            definitionKey: String
        },
        data() {
            return {
                modeler: undefined,
                xml: undefined,
                id: undefined,
                loading: false,
                visible: false,

                assigneeOptional: undefined,
                assigneeMultiple: undefined,
                assigneeContent: undefined
            };
        },
        watch: {
            definitionKey() {
                this.onload();
            },
            xml() {
                if (this.modeler === undefined) {
                    this.initialize();
                }
                this.importXML(this.xml);
            }
        },
        methods: {
            structure() {
                let definitionsId = "bpmn_" + letters(8);
                let processId = "process_" + letters(8);
                return `<?xml version="1.0" encoding="UTF-8"?>
                        <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                                          xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                                          xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                                          xmlns:camunda="http://camunda.org/schema/1.0/bpmn"
                                          xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                                          xmlns:bioc="http://bpmn.io/schema/bpmn/biocolor/1.0"
                                          xmlns:modeler="http://camunda.org/schema/modeler/1.0"
                                          targetNamespace="http://bpmn.io/schema/bpmn"
                                          exporter="Bpmn Js"
                                          exporterVersion="13.0.5"
                                          modeler:executionPlatform="Camunda Platform"
                                          modeler:executionPlatformVersion="7.19.0"
                                          id="${definitionsId}"
                                          name="${definitionsId}">
                            <bpmn:process id="${processId}" name="${processId}" isExecutable="true">
                                <bpmn:startEvent id="StartEvent_1"/>
                            </bpmn:process>
                            <bpmndi:BPMNDiagram id="BPMNDiagram_1">
                                <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="${processId}">
                                    <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
                                        <dc:Bounds x="179" y="159" width="36" height="36"/>
                                    </bpmndi:BPMNShape>
                                </bpmndi:BPMNPlane>
                            </bpmndi:BPMNDiagram>
                        </bpmn:definitions>`;
            },
            initialize() {
                this.modeler = new BpmnModeler({
                    propertiesPanel: {
                        parent: this.$refs.container
                    },
                    additionalModules: [
                        BpmnPropertiesPanelModule,
                        BpmnPropertiesProviderModule,
                        CamundaPlatformPropertiesProviderModule,
                        CustomPropertiesProviderModule,
                        ZhCnTranslate
                    ],
                    moddleExtensions: {
                        camunda: CamundaModdleDescriptors,
                        custom: CustomModdleDescriptor
                    },
                    container: this.$refs.container
                });
                this.modeler.on("import.parse.complete", this.parseComplete);
                this.modeler.on("assigneeContent.open", this.assigneeContentOpen);
            },
            importXML(xml) {
                this.modeler
                    .importXML(xml)
                    .then(ret => {
                        let canvas = this.modeler.get("canvas");
                        if (canvas) {
                            canvas.zoom("fit-viewport", true);
                        }
                        if (ret.warnings.length < 1) {
                            return;
                        }
                        let message = "";
                        for (let x of ret.warnings) {
                            message += x + ";\n";
                        }
                        this.$notify.warning({title: "警告", message});
                    })
                    .catch(() => {
                        this.$notify.error({title: "错误", message: "无法解析文档!"});
                        this.built();
                    });
            },
            parseComplete(event) {
                let {definitions} = event;
                this.id = definitions?.id;
            },
            assigneeContentOpen({assigneeOptional, assigneeMultiple, assigneeContent}) {
                this.assigneeOptional = assigneeOptional;
                this.assigneeMultiple = assigneeMultiple;
                this.assigneeContent = assigneeContent;
                this.visible = true;
            },
            async onload() {
                if (this.definitionKey) {
                    try {
                        let {data: xml} = await this.$http.get("/flows/bpmn/" + this.definitionKey);
                        if (xml) {
                            this.xml = xml;
                            return;
                        }
                        // eslint-disable-next-line no-empty
                    } catch (ignored) {}
                }
                this.xml = this.structure();
            },
            open() {
                this.$refs.file.click();
            },
            change() {
                let [file] = this.$refs.file.files;
                if (file) {
                    if (/.+\.bpmn$/i.test(file.name)) {
                        let reader = new FileReader();
                        reader.onload = () => this.importXML(reader.result);
                        reader.readAsText(file);
                        this.$refs.file.value = "";
                        return;
                    }
                    this.$notify.error({title: "错误", message: "不支持的文件格式！"});
                }
            },
            built() {
                let newXml = this.structure();
                this.importXML(newXml);
            },
            output() {
                this.modeler
                    .saveXML({format: true, preamble: true})
                    .then(ret => {
                        let a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                        a.download = this.id + ".bpmn";
                        a.rel = "noopener";

                        let xml = new Blob([ret.xml], {type: "text/xml"});
                        a.href = URL.createObjectURL(xml);

                        setTimeout(() => URL.revokeObjectURL(a.href), 30000);
                        setTimeout(() => a.click(), 0);
                    })
                    .catch(() => this.$notify.error({title: "错误", message: "导出失败！"}));
            },
            async submit() {
                if (this.loading) {
                    return this.$notify.error({title: "错误", message: "正在提交中..."});
                }

                this.loading = true;
                try {
                    const {xml} = await this.modeler.saveXML({format: true, preamble: true});

                    let form = new FormData();
                    form.append("deploymentXml", xml);

                    this.definitionKey
                        ? await this.$http.put("/flows/bpmn/" + this.definitionKey, form)
                        : await this.$http.post("/flows/bpmn", form);
                    this.$notify.success({title: "成功", message: "保存成功"});
                    this.$closeView(this.$route);
                    await this.$router.replace({name: "flow-bpmn"});
                } catch (error) {
                    this.$notify.error({title: "错误", message: error?.facade ?? "请检查文档或者网络~"});
                } finally {
                    this.loading = false;
                }
            },
            confirm(value) {
                this.modeler.get("eventBus").fire("assigneeContent.input", {value});
            }
        },
        mounted() {
            this.$nextTick(this.onload);
        },
        beforeDestroy() {
            this.modeler.destroy();
        }
    };
</script>

<style src="bpmn-js/dist/assets/diagram-js.css" />
<style src="bpmn-js/dist/assets/bpmn-js.css" />
<style src="bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css" />
<style src="@bpmn-io/properties-panel/assets/properties-panel.css" />

<style lang="scss">
    @import "@/assets/bpmn-js/custom-properties-panel.scss";

    .flow-bpmn-modeler {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #fff;

        &-container {
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
        }

        .bjs-container {
            flex: 1;
            order: 1;
            overflow: hidden;
        }

        .bio-properties-panel-container {
            flex-basis: 30%;
            flex-shrink: 0;
            flex-grow: 0;
            order: 2;
            outline: solid 1px hsl(225, 10%, 75%);
            overflow: hidden;
        }

        &-bts {
            position: absolute;
            bottom: 10px;
            left: 20px;
            background: #fafafa;
            border-radius: 2px;
            border: solid 1px #e0e0e0;
            display: flex;

            i {
                flex-shrink: 0;
                width: 38px;
                height: 38px;
                line-height: 38px;
                text-align: center;
                font-size: 20px;
                color: #555;
                position: relative;
            }

            i:not(:last-child):after {
                content: "";
                position: absolute;
                top: 20%;
                right: 0;
                height: 60%;
                border-right: 1px solid #e0e0e0;
            }
        }

        &-file {
            display: none;
            width: 0;
            height: 0;
            overflow: hidden;
        }
    }
</style>
