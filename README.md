# SwiftCart Ecommerce
A dynamic e-commerce website is built by using:
- Vanilla JavaScript
- Tailwind CSS
- FakeStore API

# Features
- Dynamic category loading
- Product filtering by category
- Responsive design
- Loading indicator
- Clean UI layout

# Live Preview
Live Link: https://swiftcart-ecommerce-dipto-bormon.netlify.app
GitHub Live Link: https://diptobormon.github.io/swiftcart-ecommerce/<br>
GitHub Repository: https://github.com/diptobormon/swiftcart-ecommerce

# Author
Dipto Bormon,<br>
Location: Hamburg, Germany

# General Knowledge
Questions and Answer:<br>
1) What is the difference between null and undefined?
Ans: undefined হইলো যখন আপনে একটা ডিব্বা বানাইছেন কিন্তু ভিতরে কিছু ভরেন নাই, জাভাস্ক্রিপ্ট নিজে থিকা ওটারে 'খালি' ধইরা রাখছে। আর null হইলো যখন আপনে ইচ্ছা কইরা ডিব্বাডারে খালি করছেন আর বলছেন যে "এহানে কিচ্ছু নাই"। সোজা কথা, undefined হইলো ভুইলা যাওয়া আর null হইলো ইচ্ছা কইরা খালি রাখা।
2) What is the use of the map() function in JavaScript? How is it different from forEach()?
Ans: map() হইলো এমন এক কামলা যে কাম শেষ কইরা নতুন একটা প্যাকেট (অ্যারে) হাতে ধরাইয়া দিবো। কিন্তু forEach() হইলো খাটুনি বেশি, সে কাম তো করবো কিন্তু ফিরতি কিছু দিবো না। যদি কাম শেষে নতুন কিছু হাতে পাইতে চান তাইলে map() লন, আর শুধু লুপ ঘুরাইতে চাইলে forEach() ই সই।
3) What is the difference between == and ===?
Ans: == খালি দেখে দুই পাশের (value) ঠিক আছে নি, জাত (type) লয়া তার মাথাব্যথা নাই। যেমন: ৫ আর '৫' তার কাছে একই। কিন্তু === হইলো different সে (value) লগে লগে জাতও চেক করবো। যদি একটা নাম্বার আর অন্যটা লেখা হয়, তাইলে সে ডাইরেক্ট না কইয়া দিবো।
4) What is the significance of async/await in fetching API data?
Ans: আগে ডাটা আনতে গেলে কোডগুলা একটার পেটে আরেকটা ঢুকতো (callback hell)। এখন async/await দিয়া কোড লিখলে পুরা পানির মতো পরিষ্কার, সিরিয়াল অনুযায়ী কাম চলতাছে। ডাটা আসা পর্যন্ত সে ওয়েট করে আর কোনো ঝামেলা হইলে try...catch দিয়া instantly ধরা যায়।
5) Explain the concept of Scope in JavaScript (Global, Function, Block).
Ans: স্কোপ হইলো কার পাওয়ার কতটুক এলাকা পর্যন্ত খাটবো। Global হইলো পুরা এলাকার বড় ভাই, তারে সবখানে পাওয়া যায়। Function হইলো ঘরের ভিতরের পাওয়ার, খালি ওই ফাংশনের ভিতরেই তারে চিনবো। আর Block হইলো একদম পার্সোনাল, শুধু { } ব্র্যাকেটের ভিতরে তার রাজত্ব; বাইরে গেলে তারে আর কেউ চিনে না।
