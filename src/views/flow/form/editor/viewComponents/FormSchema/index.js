/**
 * Created by Liu.Jun on 2020/11/20 17:44.
 */

import {letters} from "@/utils/randomizer";

export default {
    type: "object",
    required: ["id", "name"],
    properties: {
        id: {
            type: "string",
            title: "部署编码",
            "ui:placeholder": "请输入",
            "err:required": "部署编码必填",
            default: "form_" + letters(8)
        },
        name: {
            type: "string",
            title: "部署名称",
            "ui:placeholder": "请输入",
            "err:required": "部署名称必填"
        },
        formProps: {
            title: "整体配置",
            type: "object",
            description:
                "提示：如果使用行内布局（ElementUi form inline 配置），则多列布局不生效；另外页脚行内只支持一行表单项",
            required: [],
            properties: {
                inline: {
                    type: "boolean",
                    title: "行内布局",
                    default: false
                },
                inlineFooter: {
                    type: "boolean",
                    title: "页脚行内",
                    default: false
                },
                layoutColumn: {
                    title: "布局列数",
                    type: "number",
                    default: 1,
                    enum: [1, 2],
                    enumNames: ["一行一列", "一行二列"],
                    "ui:widget": "SelectWidget"
                },
                labelPosition: {
                    title: "标签位置",
                    type: "string",
                    default: "top",
                    enum: ["left", "right", "top"],
                    enumNames: ["左侧", "右侧", "上侧"]
                },
                labelWidth: {
                    title: "标签宽度",
                    type: "string",
                    default: "auto"
                },
                labelSuffix: {
                    title: "标签后缀",
                    type: "string",
                    default: "："
                }
            }
        },
        formFooter: {
            title: "页脚配置",
            type: "object",
            properties: {
                show: {
                    type: "boolean",
                    title: "底部显示",
                    default: false
                },
                okBtn: {
                    type: "string",
                    title: "确认按钮文字",
                    default: "保存"
                },
                cancelBtn: {
                    type: "string",
                    title: "取消按钮文字",
                    default: "取消"
                }
            }
        }
    }
};
