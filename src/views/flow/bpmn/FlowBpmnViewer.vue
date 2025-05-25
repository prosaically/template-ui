<template>
    <div class="flow-bpmn-viewer"></div>
</template>

<script>
    import {letters} from "@/utils/randomizer.js";
    import BpmnViewer from "bpmn-js/lib/NavigatedViewer";
    import CamundaModdleDescriptors from "camunda-bpmn-moddle/resources/camunda";
    import CustomModdleDescriptor from "@/assets/bpmn-js/CustomModdleDescriptor";

    export default {
        name: "FlowBpmnViewer",
        props: {
            definitionKey: String
        },
        data() {
            return {
                viewer: undefined,
                xml: undefined,
                loading: false
            };
        },
        watch: {
            definitionKey() {
                this.onload();
            },
            xml() {
                if (this.viewer === undefined) {
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
                this.viewer = new BpmnViewer({
                    moddleExtensions: {
                        camunda: CamundaModdleDescriptors,
                        custom: CustomModdleDescriptor
                    },
                    container: this.$el
                });
            },
            importXML(xml) {
                this.viewer
                    .importXML(xml)
                    .then(ret => {
                        let canvas = this.viewer.get("canvas");
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
            built() {
                let newXml = this.structure();
                this.importXML(newXml);
            }
        },
        mounted() {
            this.$nextTick(this.onload);
        }
    };
</script>

<style src="bpmn-js/dist/assets/diagram-js.css" />
<style src="bpmn-js/dist/assets/bpmn-js.css" />
<style src="bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css" />

<style lang="scss">
    .flow-bpmn-viewer {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #fff;
    }
</style>
