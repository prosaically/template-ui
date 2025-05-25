<template>
    <div class="flow-dmn-modeler">
        <div class="flow-dmn-modeler-container" ref="container"></div>
        <div class="flow-dmn-modeler-bts">
            <i title="打开文档" @click="open" class="el-icon-folder-opened"></i>
            <i title="新建文档" @click="built" class="el-icon-document-add"></i>
            <i title="导出文档" @click="output" class="el-icon-download"></i>
            <i title="保存文档" @click="submit" class="el-icon-check"></i>
        </div>
        <input class="flow-dmn-modeler-file" type="file" accept=".dmn" ref="file" @change="change" />
    </div>
</template>

<script>
    import {letters} from "@/utils/randomizer.js";
    import DmnModeler from "dmn-js/lib/Modeler.js";
    import {
        DmnPropertiesPanelModule,
        DmnPropertiesProviderModule,
        CamundaPropertiesProviderModule
    } from "dmn-js-properties-panel";
    import CamundaModdleDescriptor from "camunda-dmn-moddle/resources/camunda";

    export default {
        name: "FlowDmnModeler",
        props: {
            definitionKey: String
        },
        data() {
            return {
                modeler: undefined,
                xml: undefined,
                id: undefined,
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
                let id = letters(8);
                return `<?xml version="1.0" encoding="UTF-8"?>
                        <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
                                     xmlns:dmndi="https://www.omg.org/spec/DMN/20191111/DMNDI/"
                                     xmlns:dc="http://www.omg.org/spec/DMN/20180521/DC/"
                                     xmlns:modeler="http://camunda.org/schema/modeler/1.0"
                                     id="dmn-${id}" name="${id}" namespace="http://camunda.org/schema/1.0/dmn" exporter="Dmn JS"
                                     exporterVersion="14.1.5" modeler:executionPlatform="Camunda Platform"
                                     modeler:executionPlatformVersion="7.19.0">
                        </definitions>`;
            },
            initialize() {
                this.modeler = new DmnModeler({
                    drd: {
                        propertiesPanel: {
                            parent: this.$refs.container
                        },
                        additionalModules: [
                            DmnPropertiesPanelModule,
                            DmnPropertiesProviderModule,
                            CamundaPropertiesProviderModule
                        ]
                    },
                    moddleExtensions: {
                        camunda: CamundaModdleDescriptor
                    },
                    container: this.$refs.container
                });
                this.modeler.on("views.changed", this.viewsChanged);
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
            viewsChanged(event) {
                let {activeView} = event;
                if (activeView?.type === "drd") {
                    this.id = activeView.id;
                }
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
            },
            open() {
                this.$refs.file.click();
            },
            change() {
                let [file] = this.$refs.file.files;
                if (file) {
                    if (/.+\.dmn$/i.test(file.name)) {
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
                        a.download = this.id + ".dmn";
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
                        ? await this.$http.put("/flows/dmn/" + this.definitionKey, form)
                        : await this.$http.post("/flows/dmn", form);
                    this.$notify.success({title: "成功", message: "保存成功"});
                    this.$closeView(this.$route);
                    await this.$router.replace({name: "flow-dmn"});
                } catch (error) {
                    this.$notify.error({title: "错误", message: error?.facade ?? "请检查文档或者网络~"});
                } finally {
                    this.loading = false;
                }
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
<style src="@bpmn-io/properties-panel/assets/properties-panel.css" />

<style lang="scss">
    .flow-dmn-modeler {
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

        .dmn-js-parent {
            flex: 1;
            overflow: hidden;
        }

        .dmn-decision-table-container {
            padding: 10px;
            order: 1;
        }

        .bio-properties-panel-container {
            flex-basis: 30%;
            flex-shrink: 0;
            flex-grow: 0;
            order: 2;
            outline: solid 1px hsl(225, 10%, 75%);
        }

        &-bts {
            position: absolute;
            bottom: 10px;
            left: 10px;
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
