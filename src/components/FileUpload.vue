<template>
    <div class="file-upload" v-loading="loading" :style="{width, height, lineHeight: height}">
        <img v-if="avatar" :src="avatar" alt="头像" class="file-upload-img" />
        <i v-else class="el-icon-plus file-upload-icon" :style="{fontSize}"></i>
        <input class="file-upload-file" :accept="accept" type="file" ref="file" @change="change" />
    </div>
</template>

<script>
    export default {
        name: "FileUpload",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: String,
            width: {
                type: String,
                default: "60px"
            },
            height: {
                type: String,
                default: "60px"
            },
            fontSize: {
                type: String,
                default: "26px"
            },
            accept: {
                type: String,
                default: "*"
            }
        },
        data() {
            return {
                loading: false
            };
        },
        computed: {
            avatar: {
                set(value) {
                    this.$emit("input", value);
                },
                get() {
                    return this.value;
                }
            }
        },
        methods: {
            change() {
                let [file] = this.$refs.file.files;
                if (file === null || file === undefined) {
                    return;
                }

                this.loading = true;
                let form = new FormData();
                form.append("file", file);

                this.$http
                    .post("/system/upload", form)
                    .then(response => {
                        this.avatar = response.data.url;
                        this.$notify.success({title: "提示", message: "上传成功~"});
                    })
                    .catch(() => {})
                    .finally(() => (this.loading = false));
            }
        }
    };
</script>

<style lang="scss">
    .file-upload {
        display: inline-block;
        position: relative;
        overflow: hidden;
        border: 1px dashed $border-base;
        border-radius: 6px;
        cursor: pointer;
        font-size: 0;

        &:hover {
            color: $color-primary;
            border-color: $color-primary;
        }

        &-img {
            width: 100%;
            height: 100%;
            display: block;
        }

        &-icon {
            width: 100%;
            height: 100%;
            text-align: center;
            display: inline-block;
        }

        .file-upload-icon {
            line-height: inherit;
        }

        &-file {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            font-size: 0;
            cursor: pointer;
        }
    }
</style>
