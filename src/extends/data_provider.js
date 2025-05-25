/**
 * Vue form data provider
 *
 * @author: weison
 * @sine:   2023-05-15 09:39:00
 * @version 1.0.0
 */

const methods = {
    async data_operator_options(component) {
        try {
            let response = await this.$http.get("/principal/options");
            let {data = []} = this.$success(response);
            component.values = data.map(v => ({
                value: String(v.id),
                label: v.nickname
            }));
        } catch (ignored) {
            component.values = [];
        }
    },
    async apply({components}) {
        if (components?.length === undefined) {
            return;
        }
        for (let component of components) {
            let {properties} = component;
            let provider = this[properties?.provider];
            if (provider === undefined) {
                continue;
            }
            await provider(component);
        }
    }
};

export default {methods};
