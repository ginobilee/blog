联结(join):
1. select vendor_name, product_name, product_price from vendors, products where vendors.verdor_id = products.verdor_id order by verdor_name, product_name;
2. select verdor_name, product_name, product_price from vendors INNER JOIN products on vendors.verdor_id = products.verdor_id order by verdor_name, product_name;