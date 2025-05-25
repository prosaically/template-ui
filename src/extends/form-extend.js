/**
 * Vue form extends
 *
 * @author: weison
 * @sine:   2023-04-11 14:44:00
 * @version 1.0.0
 */

const data = function () {
    return {leaving: false, initial: true, history: ""};
};
const proto = data();

export default {
    data,
    watch: {
        $route: {
            handler: function () {
                if (this.leaving) {
                    return;
                }
                this.assign();
            },
            deep: true
        }
    },
    methods: {
        assign() {
            for (let key in this.$data) {
                if (Object.prototype.hasOwnProperty.call(proto, key)) {
                    continue;
                }
                this[key] = this.$route.query[key];
            }
        },
        queries() {
            let target = {};
            for (let key in this.$data) {
                if (Object.prototype.hasOwnProperty.call(proto, key)) {
                    continue;
                }
                target[key] = this.$route.query[key];
            }
            return JSON.stringify(target);
        }
    },
    activated() {
        if (this.initial) {
            return;
        }
        this.leaving = false;
        if (this.queries() === this.history) {
            return;
        }
        this.assign();
    },
    deactivated() {
        this.leaving = true;
    },
    beforeRouteLeave(to, from, next) {
        this.history = this.queries();
        next();
    },
    created() {
        this.initial = false;
        this.assign();
    }
};
