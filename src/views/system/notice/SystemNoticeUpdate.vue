<script>
    import FormExtend from "@/extends/form-extend";
    import SystemNoticeForm from "@/views/system/notice/SystemNoticeForm.vue";

    export default {
        name: "SystemNoticeUpdate",
        extends: FormExtend,
        data() {
            return {id: ""};
        },
        render() {
            return <SystemNoticeForm id={this.id} />;
        },
        components: {SystemNoticeForm}
    };
</script>
