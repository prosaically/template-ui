<template>
    <div class="editor" v-loading="loading">
        <EditorToolBar :drag-group="dragOptions.group" :config-tools="configTools" />

        <el-form
            :model="rootFormData"
            v-bind="formProps"
            class="genFromComponent"
            :class="{
                layoutColumn: !formProps.inline,
                [`layoutColumn-${formProps.layoutColumn}`]: !formProps.inline,
                formInlineFooter: formProps.inlineFooter,
                formInline: formProps.inline
                // [`genFromComponent_${schema.id}Form`]: !!schema.id,
            }"
        >
            <NestedEditor
                :child-component-list="componentList"
                :drag-options="dragOptions"
                :form-data="rootFormData"
                :form-props="formProps"
            >
                <el-form-item
                    v-if="componentList.length > 0 && formFooter.show"
                    :style="{
                        display: formProps.inline && formProps.inlineFooter ? 'inline-block' : 'block'
                    }"
                    class="formFooter_item w100 formFooter_item-editor"
                >
                    <el-button @click="$emit('onCancel')">{{ formFooter.cancelBtn }}</el-button>
                    <el-button type="primary" @click="$emit('onSubmit')">
                        {{ formFooter.okBtn }}
                    </el-button>
                </el-form-item>
            </NestedEditor>
        </el-form>

        <el-tabs v-model="activeName">
            <el-tab-pane v-if="focus" label="组件配置" name="component">
                <vue-form
                    v-model="focus.componentValue"
                    :schema="focus.componentPack.propsSchema"
                    :form-props="{labelPosition: 'right', labelWidth: '120px'}"
                    :form-footer="{show: false}"
                />
            </el-tab-pane>
            <el-tab-pane label="表单配置" name="form">
                <vue-form
                    v-model="formConfig"
                    :schema="FormSchema"
                    :form-props="{labelPosition: 'right', labelWidth: '120px'}"
                    :form-footer="{show: false}"
                />
            </el-tab-pane>
        </el-tabs>
        <div class="editor-footer">
            <input class="editor-footer-file" type="file" accept=".form" ref="file" @change="opener" />
            <el-button :loading="loading" size="small" title="新建文档" @click="clear" icon="el-icon-folder-delete" />
            <el-button :loading="loading" size="small" title="打开文档" @click="open" icon="el-icon-folder-opened" />
            <el-button :loading="loading" size="small" title="导出文档" @click="output" icon="el-icon-download" />
            <el-button :loading="loading" size="small" title="保存文档" @click="submit" icon="el-icon-check" />
        </div>
    </div>
</template>

<script>
    import FormSchema from "./viewComponents/FormSchema";
    import EditorToolBar from "./EditorToolBar.vue";

    import {deepFreeze} from "./common/utils";
    import configTools from "./config/tools";
    deepFreeze(configTools);

    import NestedEditor from "./components/NestedEditor";
    import {componentList2JsonSchema} from "./common/editorData";
    import jsonSchema2ComponentList from "./common/jsonSchema2ComponentList";
    import {schemaValidate} from "@lljj/vue-json-schema-form";

    export default {
        name: "FlowFormEditor",
        props: {
            deploymentId: String
        },
        components: {
            EditorToolBar,
            NestedEditor
        },
        provide() {
            return {
                genFormProvide: {
                    fallbackLabel: true
                }
            };
        },
        data() {
            return {
                loading: false,
                configTools,
                rootFormData: {},
                focus: null, // 选中的formItem
                componentList: [],
                FormSchema,
                formConfig: {},
                activeName: "form"
            };
        },
        computed: {
            formProps() {
                return this.formConfig.formProps ?? {};
            },
            formFooter() {
                return this.formConfig.formFooter ?? {};
            },
            dragOptions() {
                return {
                    animation: 300,
                    group: "listComponentsGroup",
                    disabled: false,
                    ghostClass: "ghostItem",
                    draggable: ".draggableItem",
                    tag: "div",
                    swapThreshold: 0.3
                };
            }
        },
        watch: {
            deploymentId() {
                this.onload();
            }
        },
        created() {
            this.$on("onFocus", editorItem => {
                this.activeName = editorItem ? "component" : "form";
                this.focus = editorItem;
            });
            this.onload();
        },
        methods: {
            onload() {
                if (this.deploymentId) {
                    this.$http
                        .get("/flows/form/" + this.deploymentId, {responseType: "text"})
                        .then(response => this.loader(response.data))
                        .catch(() => this.loader(""));
                    return;
                }
                this.loader("");
            },
            loader(code) {
                let {errorNode, componentList, formConfig} = jsonSchema2ComponentList(code, this.configTools) ?? {};
                if (Array.isArray(errorNode) && errorNode.length > 0) {
                    this.$notify.error({title: "错误", message: "文件无法读取！"});
                    return;
                }

                this.componentList = componentList ?? [];
                this.formConfig = formConfig ?? {};
            },
            exporter() {
                const {formConfig: formData, FormSchema: schema} = this;
                let {errors} = schemaValidate.ajvValidateFormData({formData, schema});
                if (errors.length) {
                    return Promise.reject("请检查您的表单配置~");
                }

                return Promise.resolve({
                    schema: componentList2JsonSchema(this.componentList),
                    uiSchema: {},
                    ...formData
                });
            },
            clear() {
                this.componentList = [];
            },
            open() {
                this.$refs.file.click();
            },
            opener() {
                let [file] = this.$refs.file.files;
                if (file) {
                    if (/.+\.form$/i.test(file.name)) {
                        let reader = new FileReader();
                        reader.onload = () => this.loader(reader.result);
                        reader.readAsText(file);
                        this.$refs.file.value = "";
                        return;
                    }
                    this.$notify.error({title: "错误", message: "不支持的文件格式！"});
                }
            },
            async output() {
                try {
                    let schema = await this.exporter();
                    let {formProps} = schema;
                    let json = JSON.stringify(schema, undefined, 4);

                    let a = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                    a.download = formProps.id + ".form";
                    a.rel = "noopener";

                    let blob = new Blob([json], {type: "text/json"});
                    a.href = URL.createObjectURL(blob);

                    setTimeout(() => URL.revokeObjectURL(a.href), 30000);
                    setTimeout(() => a.click(), 0);
                } catch ({message}) {
                    this.$notify.error({title: "错误信息", message});
                }
            },
            async submit() {
                if (this.loading) {
                    return;
                }
                this.loading = true;
                try {
                    let schema = await this.exporter();
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
                    this.$notify.error({title: "错误", message: error?.facade ?? error});
                } finally {
                    this.loading = false;
                }
            }
        }
    };
</script>

<style lang="scss">
    .editor {
        position: relative;
        height: 100%;
        width: 100%;
        display: grid;
        grid-template-columns: 260px auto 380px;
        grid-template-rows: auto 54px;
        overflow: hidden;

        > .el-form {
            position: relative;
            overflow: hidden;
        }

        > .el-tabs {
            padding: 10px;
            background-color: #fff;
            overflow-x: hidden;
            overflow-y: auto;

            &::-webkit-scrollbar {
                width: 0;
                height: 0;
            }
        }

        &-footer {
            border-top: 1px solid $border-base;
            grid-column: span 3;
            background-color: #fff;
            padding: 10px;
            text-align: right;

            &-file {
                display: none;
                width: 0;
                height: 0;
                overflow: hidden;
            }
        }
    }
</style>
