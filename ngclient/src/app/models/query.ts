interface Order {
    column: string;
    dir: string;
}

export interface Query {
    order: Order;
}
