<template>
    <draggable
        ref="draggable"
        :list="childComponentList"
        v-bind="dragOptions"
        :class="[$style.dragArea, $style.formItemWrap]"
        @change="handleDragChange"
    >
        <div
            v-for="item in childComponentList"
            :key="item.id"
            :class="{
                draggableItem: true,
                w100: showNestedEditor(item),
                [$style.formItem]: true
            }"
            :style="
                item.componentValue.baseValue.uiOptions.width
                    ? {
                          width: item.componentValue.baseValue.uiOptions.width,
                          flexBasis: item.componentValue.baseValue.uiOptions.width
                      }
                    : {}
            "
        >
            <ViewComponentWrap
                :form-data="formData"
                :editor-item="item"
                :drag-options="dragOptions"
                :show-nested-editor="showNestedEditor"
                :form-props="formProps"
                @onOperate="handleItemOperate"
            />
        </div>
        <template #footer>
            <slot></slot>
        </template>
    </draggable>
</template>

<script>
    import Draggable from "vuedraggable";
    import {generateEditorItem} from "../common/editorData";

    // 避免循环依赖导致undefined
    const ViewComponentWrap = () => import("./ViewComponentWrap");

    export default {
        name: "NestedEditor",
        components: {
            Draggable,
            ViewComponentWrap
        },
        props: {
            dragOptions: {
                type: Object,
                default: () => ({})
            },
            formData: {
                type: Object,
                default: () => ({})
            },
            childComponentList: {
                type: Array,
                default: () => []
            },
            formProps: {
                type: null,
                default: null
            }
        },
        watch: {
            childComponentList() {
                this.computedComponentToolBarStatus();
            }
        },
        created() {},
        methods: {
            showNestedEditor(editorItem) {
                return editorItem.childList && !editorItem.componentPack.viewSchema.format;
            },
            handleDragChange(...args) {
                console.log(args);
            },
            // 计算各个组件状态栏按钮状态
            computedComponentToolBarStatus() {
                this.childComponentList.forEach((component, index) => {
                    Object.assign(component.toolBar, {
                        moveUpDisabled: index < 1,
                        moveDownDisabled: index > this.childComponentList.length - 2,
                        removeDisabled: component.additional?.unRemove
                    });
                });
            },
            // 操作单个组件
            handleItemOperate({item, command}) {
                const handler = {
                    moveUp(target, current) {
                        let index = target.indexOf(current);
                        target.splice(index - 1, 2, current, target[index - 1]);
                    },
                    moveDown(target, current) {
                        let index = target.indexOf(current);
                        target.splice(index, 2, target[index + 1], current);
                    },
                    copy(target, current) {
                        // eslint-disable-next-line no-unused-vars
                        const {componentValue, ...skeleton} = current;
                        target.splice(target.indexOf(current) + 1, 0, generateEditorItem(skeleton));
                    },
                    remove(target, current) {
                        target.splice(target.indexOf(current), 1);
                    }
                }[command];

                if (handler) {
                    handler.apply(this, [this.childComponentList, item]);
                } else {
                    this.$notify.error({title: "系统错误", message: `未知的操作：[${command}]`});
                }
            }
        }
    };
</script>

<style lang="scss" module>
    :global {
        .ghostItem {
            opacity: 0.6;
            background-color: $color-primary-light-4 !important;
            box-shadow: 0 0 1px 0 $color-primary;

            &.draggableToolItem {
                margin-top: 0;
                width: 100%;
                max-width: 100%;
                margin-bottom: 10px;
                height: 130px;
                line-height: 130px;
            }
        }
        .el-form--label-left,
        .el-form--label-right {
            .draggableToolItem {
                height: 100px;
                line-height: 100px;
            }
        }

        /* inline 布局 */
        .el-form--inline {
            :local .formItem {
                display: inline-block;
                margin-right: 10px;
                vertical-align: top;
            }

            .draggableToolItem {
                width: auto;
                max-width: none;
                padding: 0 20px;
                display: inline-block;
                margin-right: 10px;
                vertical-align: top;
            }

            .w100 {
                width: 100%;
            }

            .formFooter_item-editor {
                width: auto;
                max-width: none;
            }
        }

        /* column 布局 */
        .layoutColumn {
            .w100 {
                width: 100% !important;
            }

            :local {
                .formItemWrap {
                    :global {
                        .el-form-item {
                            width: 100% !important;
                            flex-basis: 100% !important;
                        }
                    }
                }
            }

            :local .formItem {
                display: inline-block;
                vertical-align: top;
            }

            .draggableToolItem {
                display: inline-block;
                vertical-align: top;
                border: none;
            }

            &.layoutColumn-1 {
                :local .formItem {
                    width: 100%;
                }

                .draggableToolItem {
                    width: 100%;
                }
            }

            &.layoutColumn-2 {
                :local .formItem {
                    width: 50%;
                }

                .draggableToolItem {
                    width: 49.6%;
                }
            }

            &.layoutColumn-3 {
                :local .formItem {
                    width: 33.333%;
                }

                .draggableToolItem {
                    width: 33%;
                }
            }
        }
    }

    .dragArea {
        width: 100%;
        box-sizing: border-box;
        font-size: 0;
        background-color: #f5f5f5;
        height: 100%;
        padding: 15px;
        overflow: auto;

        &:empty:after {
            position: relative;
            top: 50%;
            left: calc(50% - 6em);
            font-size: 16px;
            content: "拖拽左侧栏的组件进行添加";
        }

        :global {
            .fieldGroupWrap_box {
                display: none !important;
            }

            .emptyBox {
                min-height: 350px;
                display: flex;
                justify-content: center;
                align-items: center;
            }

            .viewEmpty_IconBox {
                color: $color-primary-light-7;
                font-size: 50px;
                text-align: center;
            }

            .el-image {
                vertical-align: top;
            }
        }
    }
</style>
