<template>
    <div class="flow-form-editor">
        <div class="flow-form-editor-container" ref="container"></div>
        <div class="flow-form-editor-bts">
            <el-input v-model="name" placeholder="请输入部署名称">
                <template #prepend>部署名称</template>
            </el-input>
            <i title="打开文档" @click="open" class="el-icon-folder-opened"></i>
            <i title="新建文档" @click="built" class="el-icon-document-add"></i>
            <i title="导出文档" @click="output" class="el-icon-download"></i>
            <i title="保存文档" @click="submit" class="el-icon-check"></i>
        </div>
        <input class="flow-form-editor-file" type="file" accept=".form" ref="file" @change="change" />
    </div>
</template>

<script>
    import {Input} from "element-ui";
    import {FormEditor} from "@bpmn-io/form-js";
    import "@bpmn-io/form-js/dist/assets/form-js.css";
    import "@bpmn-io/form-js/dist/assets/form-js-editor.css";
    import {letters} from "@/utils/randomizer";

    export default {
        name: "FlowFormEditor",
        props: {
            deploymentId: String
        },
        data() {
            return {
                editor: undefined,
                schema: undefined,

                id: undefined,
                name: undefined,
                loading: false
            };
        },
        watch: {
            deploymentId() {
                this.onload();
            },
            schema() {
                if (this.editor === undefined) {
                    this.initialize();
                }
                this.importSchema(this.schema);
            }
        },
        methods: {
            structure() {
                return {id: "form_" + letters(8), type: "default"};
            },
            initialize() {
                this.editor = new FormEditor({
                    container: this.$refs.container
                });
                this.editor.on("changed", this.formChanged);
            },
            importSchema(schema) {
                this.editor
                    .importSchema(schema)
                    .then(ret => {
                        this.name = schema.name;
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
            formChanged(event) {
                let {schema} = event;
                if (schema?.id) {
                    this.id = schema.id;
                }
            },
            async onload() {
                if (this.deploymentId) {
                    try {
                        let {data: form} = await this.$http.get("/flows/form/" + this.deploymentId);
                        if (form) {
                            this.schema = form;
                            return;
                        }
                        // eslint-disable-next-line no-empty
                    } catch (ignored) {}
                }
                this.schema = this.structure();
            },
            open() {
                this.$refs.file.click();
            },
            change() {
                let [file] = this.$refs.file.files;
                if (file) {
                    if (/.+\.form$/i.test(file.name)) {
                        let reader = new FileReader();
                        reader.onload = () => {
                            let json = JSON.parse(reader.result);
                            this.importSchema(json);
                        };
                        reader.readAsText(file);
                        this.$refs.file.value = "";
                        return;
                    }
                    this.$notify.error({title: "错误", message: "不支持的文件格式！"});
                }
            },
            built() {
                let newSchema = this.structure();
                this.importSchema(newSchema);
            },
            output() {
                let schema = this.editor.saveSchema();
                let {id} = schema;
                let json = JSON.stringify(schema);

                let a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                a.download = id + ".form";
                a.rel = "noopener";

                let blob = new Blob([json], {type: "text/json"});
                a.href = URL.createObjectURL(blob);

                setTimeout(() => URL.revokeObjectURL(a.href), 30000);
                setTimeout(() => a.click(), 0);
            },
            async submit() {
                if (this.loading) {
                    return this.$notify.error({title: "错误", message: "正在提交中..."});
                }
                if (this.name === undefined || this.name == null || this.name.length < 1) {
                    return this.$notify.error({title: "错误", message: "部署名称不能为空"});
                }

                this.loading = true;
                try {
                    const schema = await this.editor.saveSchema();
                    schema.name = this.name;
                    let json = JSON.stringify(schema);

                    let form = new FormData();
                    form.append("deploymentJson", json);

                    this.deploymentId
                        ? await this.$http.put("/flows/form/" + this.deploymentId, form)
                        : await this.$http.post("/flows/form", form);
                    this.$notify.success({title: "成功", message: "保存成功"});
                    this.$closeView(this.$route);
                    await this.$router.replace({name: "flow-form"});
                } catch (error) {
                    this.$notify.error({title: "错误", message: error?.facade ?? "请检查文档或者网络~"});
                } finally {
                    this.loading = false;
                }
            }
        },
        mounted() {
            this.$nextTick(this.onload);
        },
        components: {"el-input": Input}
    };
</script>

<style lang="scss">
    .flow-form-editor {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background-color: #fff;

        &-container {
            flex: 1;
            width: 100%;
            overflow: hidden;
        }

        &-bts {
            flex-shrink: 0;
            flex-grow: 0;
            height: 54px;
            width: 100%;
            bottom: 10px;
            left: 10px;
            background-color: #fff;
            border-top: solid 1px #e0e0e0;
            display: flex;
            align-content: center;
            align-items: center;
            padding: 10px;

            .el-input {
                width: 240px;
            }

            i {
                flex-shrink: 0;
                width: 38px;
                height: 38px;
                line-height: 38px;
                text-align: center;
                font-size: 20px;
                color: #555;
                background: #fafafa;
                border-radius: 2px;
                border: solid 1px #e0e0e0;
                margin-left: 10px;
            }

            i:first-of-type {
                margin-left: auto;
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
