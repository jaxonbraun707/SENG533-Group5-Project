import http from 'k6/http';
import { sleep } from 'k6';
import { vu } from 'k6/execution';
import { Trend } from 'k6/metrics';

export let options = {
    stages: [
	{ duration: '1m', target: 50 }, // ramp up to 50 users
	{ duration: '5m', target: 50 }, // stay at 50 users
	{ duration: '1m', target: 0 }, //ramp down to 0 users
    ],
};

// database settings:
// Number of catagories: 10
// number of products per catagory: 100
// number of users: 500
// number of orders per user: 5
// number of products per page: 20
// number of products: 1000
// reset database after every scirpt that is ran with the above settings

const httpDuration = new Trend('avg_http_duration');

export default function () {
	let responseTimes = [];

	sleep(Math.random(3));

    // login to a user using the vu's id
	let r = http.get('http://localhost/tools.descartes.teastore.webui');
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	const paramslogin = {
		referer:"http://localhost/tools.descartes.teastore.webui",
		username: "user" + (vu.idInTest % 500),
		password: "password",
		signin: "Sign in"
	};
	r = http.post('http://localhost/tools.descartes.teastore.webui/loginAction', paramslogin);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));

	// user browses some catagories
	let catagory = Math.floor(Math.random() * (11 - 2 + 1) + 2);
	let page = Math.floor(Math.random() * (5 - 1 + 1) + 1);
	r = http.get("http://localhost/tools.descartes.teastore.webui/category?category="+catagory+"&page="+page);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	catagory = Math.floor(Math.random() * (11 - 2 + 1) + 2);
	page = Math.floor(Math.random() * (5 - 1 + 1) + 1);
	r = http.get("http://localhost/tools.descartes.teastore.webui/category?category="+catagory+"&page="+page);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	catagory = Math.floor(Math.random() * (11 - 2 + 1) + 2);
	page = Math.floor(Math.random() * (5 - 1 + 1) + 1);
	r = http.get("http://localhost/tools.descartes.teastore.webui/category?category="+catagory+"&page="+page);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));

	// user views some specific product pages and adds the products to their cart
	let product1 = Math.floor(Math.random() * (1011 - 12 + 1) + 12);
	r = http.get("http://localhost/tools.descartes.teastore.webui/product?id="+product1);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	const paramsCart1 = {
		productid: product1,
		addToCart: "Add To Cart"
	};
	r = http.post("http://localhost/tools.descartes.teastore.webui/cartAction",paramsCart1);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));

	let product2 = Math.floor(Math.random() * (1011 - 12 + 1) + 12);
	r = http.get("http://localhost/tools.descartes.teastore.webui/product?id="+product2);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	const paramsCart2 = {
		productid: ""+product2,
		addToCart: "Add To Cart"
	};
	r = http.post("http://localhost/tools.descartes.teastore.webui/cartAction",paramsCart2);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	
	// view cart, then procede to checkout
	r = http.get("http://localhost/tools.descartes.teastore.webui/cart");
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	let paramsProcedeToCheckout;
	// procede to checkout
	if(product1==product2){
		paramsProcedeToCheckout = {
			productid: product1,
			["orderitem_"+product1]: 2,
			proceedtoCheckout: "Proceed to Checkout"
		};
	}
	else{
		paramsProcedeToCheckout = {
			productid: product1,
			["orderitem_"+product1]: 1,
			productid: product2,
			["orderitem_"+product2]: 1,
			proceedtoCheckout: "Proceed to Checkout"
		};
	}
	r = http.post("http://localhost/tools.descartes.teastore.webui/cartAction", paramsProcedeToCheckout);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	// confirm shipping details
	const paramsConfirmOrder = {
		firstname: "Jon",
		lastname: "Snow",
		address1: "Winterfell",
		address2: "11111 The North, Westeros",
		cardtype: "volvo",
		cardnumber: "314159265359",
		expirydate: "12/2025",
		confirm: "Confirm"
	};
	r = http.post("http://localhost/tools.descartes.teastore.webui/cartAction", paramsConfirmOrder);
	responseTimes.push(r.timings.duration);
	sleep(Math.random(3));
	// user logs out
	const paramslogout = {logout: ''};
	r = http.post('http://localhost/tools.descartes.teastore.webui/loginAction', paramslogout);
	responseTimes.push(r.timings.duration);
	responseTimes.sort((a, b) => a-b);
	const midIndex = Math.floor(responseTimes.length / 2);
	let median = 0;
	if (responseTimes.length % 2 == 0){
		median = (responseTimes[midIndex-1] + responseTimes[midIndex]) / 2;
	} else {
		median = responseTimes[midIndex];
	}
	httpDuration.add(median);
}