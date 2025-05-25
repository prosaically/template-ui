/**
 * Created by Liu.Jun on 2020/11/27 11:03 下午.
 */

import genSchema from "../genSchema.js";

const viewSchema = {
    title: "单文件",
    type: "string",
    "ui:widget": "UploadWidget"
};
export default {
    viewSchema,
    propsSchema: genSchema({
        options: {
            type: "object",
            title: "选项",
            required: [],
            properties: {
                uiOptions: {
                    type: "object",
                    required: ["action"],
                    properties: {
                        action: {
                            title: "上传接口",
                            type: "string",
                            format: "uri",
                            default: process.env.VUE_APP_BASE_URL + "/system/upload"
                        },
                        withCredentials: {
                            title: "携带凭证",
                            type: "boolean",
                            default: true
                        },
                        accept: {
                            title: "接受类型",
                            type: "string"
                        },
                        btnText: {
                            title: "按钮文字",
                            type: "string"
                        }
                    }
                }
            }
        }
    })
};
