import { connection } from "../config/db.mjs";

function getInvoiceModel(callback) {
    const query = `
        SELECT 
            t.transaction_id,
            IFNULL(t.customer_id, 'N/A') AS customer_id,
            IFNULL(c.firstname, 'Guest') AS firstname,
            IFNULL(c.lastname, '') AS lastname,
            IFNULL(c.alias, 'Use this account for pick-up only') AS alias,
            IFNULL(c.sitio, 'Bangkal Tumoy') AS sitio,
            IFNULL(c.barangay, 'Ibabao') AS barangay,
            IFNULL(c.city, 'Cordova') AS city,
            IFNULL(c.province, 'Cebu') AS province,
            t.user_id,
            t.subTotal,
            t.discountPercentage,
            t.totalDue,
            t.cash,
            t.change_amount,
            t.selectedService,
            t.paymentStatus,
            t.orderStatus,
            t.orderNumber,
            t.notes,
            t.transaction_date,
            IFNULL(c.mobile1, 'N/A') AS mobile1,
            GROUP_CONCAT(
                CONCAT(
                    '{"item_id":"', IFNULL(ti.item_id, ''), '",',
                    '"quantity":', IFNULL(ti.quantity, 0), ',',
                    '"free":', IFNULL(ti.free, 0), ',',
                    '"total":', IFNULL(ti.total, 0), ',',
                    '"title":"', IFNULL(i.title, 'No Title'), '",',
                    '"deliver":', IFNULL(i.deliver, 0), ',',
                    '"pick_up":', IFNULL(i.pick_up, 0), ',',
                    '"buy":', IFNULL(i.buy, 0), ',',
                    '"image_item":"', IFNULL(i.image_item, 'No Image'), '"}'
                ) SEPARATOR ','
            ) AS items
        FROM 
            transaction t
        LEFT JOIN 
            customer c ON t.customer_id = c.customer_id
        LEFT JOIN 
            transaction_items ti ON t.transaction_id = ti.transaction_id
        LEFT JOIN 
            item i ON ti.item_id = i.item_id
        GROUP BY 
            t.transaction_id
        ORDER BY 
            t.transaction_date DESC;
    `;

    connection.query(query, (error, results) => {
        if (error) {
            console.error("Error fetching invoices:", error);
            return callback(error, null);
        }

        // Process the results and return them
        const processedResults = results.map(invoice => ({
            transaction_id: invoice.transaction_id,
            customer_id: invoice.customer_id,
            firstname: invoice.firstname,
            lastname: invoice.lastname,
            alias: invoice.alias,
            sitio: invoice.sitio,
            barangay: invoice.barangay,
            city: invoice.city,
            province: invoice.province,
            user_id: invoice.user_id,
            subTotal: invoice.subTotal,
            discountPercentage: invoice.discountPercentage,
            totalDue: invoice.totalDue,
            cash: invoice.cash,
            change_amount: invoice.change_amount,
            selectedService: invoice.selectedService,
            paymentStatus: invoice.paymentStatus,
            orderStatus: invoice.orderStatus,
            orderNumber: invoice.orderNumber,
            notes: invoice.notes,
            transaction_date: invoice.transaction_date,
            mobile1: invoice.mobile1,
            items: invoice.items ? JSON.parse(`[${invoice.items}]`) : [] // Parse items JSON
        }));

        callback(null, processedResults);
    });
}

export { getInvoiceModel };
