<template>
    <el-upload
        class="avatar-upload"
        action="/api/system/upload"
        accept="image/*"
        with-credentials
        :disabled="disabled"
        :show-file-list="false"
        :on-success="onSuccess"
        :on-error="onError"
        :before-upload="beforeUpload"
    >
        <img v-if="image" :src="image" class="avatar-upload-img" alt="头像图片" />
        <i v-else class="el-icon-plus"></i>
    </el-upload>
</template>

<script>
    import {Upload} from "element-ui";

    export default {
        name: "AvatarUpload",
        model: {
            prop: "value",
            event: "input"
        },
        props: {
            value: String,
            disabled: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            image: {
                set(value) {
                    this.$emit("input", value);
                },
                get() {
                    return this.value;
                }
            }
        },
        methods: {
            onSuccess(body) {
                this.image = body.url;
            },
            onError(body) {
                let message = body instanceof Error ? body.message : "上传商品图片失败~";
                this.$notify.error({title: "错误", message});
            },
            beforeUpload(file) {
                if (file.size / 1024 / 1024 > 2) {
                    this.$message.error("上传头像图片大小不能超过 2MB!");
                    return false;
                }
                return true;
            }
        },
        components: {
            "el-upload": Upload
        }
    };
</script>

<style lang="scss">
    .avatar-upload {
        position: relative;

        .el-upload {
            border: 1px dashed #d9d9d9;
            border-radius: 6px;
            position: relative;
            overflow: hidden;

            &:hover {
                border-color: $color-primary;
            }
        }

        .el-icon-plus {
            font-size: 28px;
            color: #8c939d;
            width: 178px;
            height: 178px;
            line-height: 178px;
            text-align: center;
        }

        &-img {
            width: 178px;
            height: 178px;
            display: block;
        }
    }
</style>
