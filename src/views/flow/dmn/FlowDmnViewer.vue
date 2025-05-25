<template>
    <div class="flow-dmn-viewer"></div>
</template>

<script>
    import DmnViewer from "dmn-js/lib/NavigatedViewer.js";
    import CamundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";

    export default {
        name: "FlowDmnViewer",
        props: {
            definitionKey: String
        },
        data() {
            return {
                modeler: undefined,
                xml: undefined,
                loading: false
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
                return `<?xml version="1.0" encoding="UTF-8"?>
                        <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                                     xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
                                     xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
                                     xmlns:modeler="http://camunda.org/schema/modeler/1.0"
                                     id="empty" name="空白文档" namespace="http://camunda.org/schema/1.0/dmn" exporter="Dmn JS"
                                     exporterVersion="14.1.5" modeler:executionPlatform="Camunda Platform"
                                     modeler:executionPlatformVersion="7.19.0">
                        </definitions>`;
            },
            initialize() {
                this.modeler = new DmnViewer({
                    moddleExtensions: {
                        camunda: CamundaModdleDescriptor
                    },
                    container: this.$el
                });
            },
            importXML(xml) {
                this.modeler
                    .importXML(xml)
                    .then(ret => {
                        const activeView = this.modeler.getActiveView();
                        if (activeView?.type === "drd") {
                            this.modeler.getActiveViewer().get("canvas").zoom("fit-viewport", true);
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
                        let {data: xml} = await this.$http.get("/flows/dmn/" + this.definitionKey);
                        if (xml) {
                            this.xml = xml;
                            return;
                        }
                        // eslint-disable-next-line no-empty
                    } catch (ignored) {}
                }
                this.xml = this.structure();
            }
        },
        mounted() {
            this.$nextTick(this.onload);
        }
    };
</script>

<style src="dmn-js/dist/assets/diagram-js.css" />
<style src="dmn-js/dist/assets/dmn-js-drd.css" />
<style src="dmn-js/dist/assets/dmn-js-decision-table.css" />
<style src="dmn-js/dist/assets/dmn-js-decision-table-controls.css" />
<style src="dmn-js/dist/assets/dmn-js-literal-expression.css" />
<style src="dmn-js/dist/assets/dmn-js-shared.css" />
<style src="dmn-js/dist/assets/dmn-font/css/dmn.css" />

<style lang="scss">
    .flow-dmn-viewer {
        position: relative;
        width: 100%;
        height: 100%;
        overflow: hidden;
        background-color: #fff;
    }
</style>
