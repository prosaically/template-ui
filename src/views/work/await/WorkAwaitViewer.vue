<script>
    import {Dialog} from "element-ui";
    import ProcessInstance from "@/flow/ProcessInstance.js";

    export default {
        name: "WorkAwaitViewer",
        mixins: [ProcessInstance],
        props: {
            taskId: String
        },
        computed: {
            readonly() {
                return true;
            },
            uri() {
                return this.taskId ? "/works/awaits/" + this.taskId + "?notify=" : undefined;
            }
        },
        methods: {
            approvable() {
                return true;
            }
        },
        components: {"el-dialog": Dialog},
        render(builder, context) {
            return builder(
                "el-dialog",
                {
                    props: {
                        customClass: "work-await-viewer",
                        title: "查看待办流程",
                        visible: this.visible,
                        closeOnClickModal: false,
                        modalAppendToBody: false,
                        top: "15vh",
                        width: "54vw"
                    },
                    on: {
                        "update:visible": value => (this.visible = value)
                    }
                },
                [ProcessInstance.render.call(this, builder, context)]
            );
        }
    };
</script>

<style src="bpmn-js/dist/assets/diagram-js.css" />
<style src="bpmn-js/dist/assets/bpmn-js.css" />
<style src="bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css" />
<style lang="scss" src="../../../flow/ProcessInstance.scss" />

<style lang="scss">
    .work-await-viewer {
        height: 70vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;

        .el-dialog__header {
            flex-shrink: 0;
        }

        .el-dialog__body {
            flex: 1;
            overflow-x: hidden;
            overflow-y: auto;
            padding: 0;
            background-color: $background-color;
        }

        .el-dialog__footer {
            flex-shrink: 0;
        }
    }
</style>
