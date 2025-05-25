<template>
    <editor v-model="data" api-key="no-api-key" :disabled="readonly" :init="config" />
</template>

<script>
    import Editor from "@tinymce/tinymce-vue";

    export default {
        name: "RichTextEditor",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: {
                type: String,
                default: ""
            },
            plugins: {
                type: Array,
                default: () => [
                    "advlist anchor autolink charmap code codesample fullscreen help",
                    "image imagetools link lists media multiplot paste preview print searchreplace table",
                    "visualblocks visualchars wordcount"
                ]
            },
            readonly: {
                type: Boolean,
                default: false
            },
            verifyHtml: {
                type: Boolean,
                default: false
            },
            convertUrls: {
                type: Boolean,
                default: false
            },
            fontFormats: {
                type: String,
                default: "Arial=arial,helvetica,sans-serif;"
            },
            branding: {
                type: Boolean,
                default: false
            },
            height: {
                type: [Number, String],
                default: 500
            },
            menubar: {
                type: Boolean,
                default: true
            },
            placeholder: {
                type: String,
                default: "这里是工作区喔~"
            },
            toolbar: {
                type: String,
                default: `undo redo |
                        formatselect | fontsizeselect forecolor backcolor |
                        aligncenter alignjustify alignleft alignright outdent indent |
                        bold italic strikethrough subscript superscript underline |
                        bullist numlist |
                        table tablerowprops tablecellprops |
                        charmap image link media multiplot anchor codesample blockquote |
                        removeformat preview fullscreen`
            },
            toolbarMode: {
                type: String,
                default: "wrap"
            }
        },
        data() {
            return {};
        },
        computed: {
            data: {
                set(value) {
                    this.$emit("input", value);
                },
                get() {
                    return this.value;
                }
            },
            config() {
                let {
                    plugins,
                    readonly,
                    verifyHtml: verify_html,
                    convertUrls: convert_urls,
                    branding,
                    fontFormats: font_formats,
                    height,
                    menubar,
                    placeholder,
                    toolbar,
                    toolbarMode: toolbar_mode
                } = this;

                return {
                    // 集成配置
                    plugins,
                    readonly,
                    verify_html,

                    // URL配置
                    convert_urls,

                    // 界面配置
                    branding,
                    font_formats,
                    height,
                    menubar,
                    placeholder,
                    toolbar,
                    toolbar_mode,

                    // 上传配置
                    automatic_uploads: true,
                    block_unsupported_drop: true,
                    file_picker_types: "image media",
                    images_reuse_filename: false,
                    images_upload_handler: this.imageUploadHandler,

                    // 本地化
                    language: "zh_CN",

                    // 粘贴插件
                    paste_data_images: true
                };
            }
        },
        methods: {
            imageUploadHandler(blobInfo, success, failure, progress) {
                let file = blobInfo.blob();
                if (file === null || file === undefined) {
                    return failure("请选择上传文件");
                }

                let form = new FormData();
                let filename = blobInfo.filename();
                form.append("file", file, filename);

                this.$http
                    .post("/system/upload", form, {
                        onUploadProgress: e => progress((e.loaded / e.total) * 100)
                    })
                    .then(response => success(response.data.url))
                    .catch(error => failure(error?.facade || "文件上传失败，请重试~"));
            }
        },
        components: {
            editor: Editor
        }
    };
</script>

<style lang="scss">
    .ck-content {
        em,
        i {
            font-style: italic;
        }

        ul,
        ol,
        li {
            list-style-position: inside;
        }

        ul {
            list-style-type: disc;
        }

        ol {
            list-style-type: decimal;
        }

        a {
            color: $color-primary;
            text-decoration: underline;
        }
    }
</style>
