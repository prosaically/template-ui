<template>
    <vue-form
        v-model="formData"
        :schema="schema"
        :ui-schema="uiSchema"
        :form-props="formProps"
        :form-footer="formFooter"
    />
</template>

<script>
    export default {
        name: "FlowFormViewer",
        props: {
            deploymentId: String
        },
        data() {
            return {
                formData: {},
                schema: {},
                uiSchema: {},
                formProps: {},
                formFooter: {show: false}
            };
        },
        watch: {
            deploymentId() {
                this.onload();
            }
        },
        methods: {
            onload() {
                if (this.deploymentId) {
                    this.$http
                        .get("/flows/form/" + this.deploymentId)
                        .then(response => this.loader(response.data))
                        .catch(() => this.loader({}));
                    return;
                }
                this.loader({});
            },
            loader({schema = {}, uiSchema = {}, formProps = {}, formFooter = {show: false}}) {
                this.schema = schema;
                this.uiSchema = uiSchema;
                this.formProps = formProps;
                this.formFooter = formFooter;
                this.formData = {};
            }
        },
        created() {
            this.onload();
        }
    };
</script>
