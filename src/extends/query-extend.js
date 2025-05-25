/**
 * Vue query extends
 *
 * @author: weison
 * @sine:   2023-04-11 14:44:00
 * @version 1.0.0
 */

import PagingExtend from "./paging-extend.js";

export default {
    extends: PagingExtend,
    data() {
        return {
            url: undefined,
            model: "",
            visible: false,
            loading: false,
            leaving: false,
            initial: true,
            history: ""
        };
    },
    watch: {
        $route: {
            handler: function () {
                if (this.leaving) {
                    return;
                }
                this.onload();
            },
            deep: true
        }
    },
    computed: {
        observes() {
            return {};
        }
    },
    methods: {
        search() {
            let kvs = this.$clone(this.$route.query);
            for (let key in this.observes) {
                kvs[key] = this[key];
            }
            kvs.pageSize = this.pageSize;
            kvs.pageNo = this.pageNo = 1;
            kvs.afresh = Math.random();
            this.loading = true;
            this.toHref(kvs);
        },
        pageChange(e) {
            let kvs = this.$clone(this.$route.query);
            kvs.pageNo = e;
            kvs.pageSize = this.pageSize;

            this.toHref(kvs);
        },
        toHref(query) {
            this.$router.replace({path: this.$route.path, query});
        },
        onload() {
            let params = this.relay();
            if (this.url === undefined) {
                return;
            }
            this.$http.get(this.url, {params}).then(this.success).catch(this.error).finally(this.complete);
        },
        relay() {
            let params = this.$clone(this.$route.query);

            // 装载默认
            for (const writeKey in this.observes) {
                if (Object.prototype.hasOwnProperty.call(params, writeKey)) {
                    continue;
                }
                params[writeKey] = this.observes[writeKey];
            }
            params.pageNo ||= this.pageNo;
            params.pageSize ||= this.pageSize;

            // 回写参数
            for (const readKey in this.observes) {
                let typeName = typeof this.observes[readKey];
                this[readKey] = {
                    string: value => value,
                    number: value => parseFloat(value),
                    boolean: value => value === true || value === "true",
                    null: value => value,
                    undefined: value => value,
                    symbol: value => Symbol(value),
                    object: value => value
                }[typeName](params[readKey]);
            }
            this.pageNo = params.pageNo >> 0;
            this.pageSize = params.pageSize >> 0;
            return params;
        },
        success({data}) {
            let {records = [], total = 0, size, current} = data?.data ?? data ?? {};
            this.total = total;
            this.pageSize = size ?? this.pageSize;
            this.pageNo = current ?? this.pageNo;
            this.records = records;
        },
        error() {
            // Default not implemented
        },
        complete() {
            this.loading = false;
        },
        cancel() {
            this.visible = false;
        },
        queries() {
            let {fullPath, hash, path, params, query} = this.$route;
            return JSON.stringify({fullPath, hash, path, params, query});
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
        this.onload();
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
        this.onload();
    }
};
