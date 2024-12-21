<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import yearlySalesReportComponent from '../components/yearlySalesReportComponent.vue';
import { Chart, registerables } from 'chart.js';
import axios from '../../axios';
import { format } from 'date-fns'; // Import date-fns for date formatting
import { ref, onMounted, watch } from 'vue';

Chart.register(...registerables);

const chartRef = ref(null); // Reference for the canvas
let chartInstance = null;

const chartData = ref({
    labels: [], // Days of the month
    totalDue: [], // Total Due per day
    totalQuantity: [], // Total Quantity per day
    formattedDates: [], // Formatted dates for tooltip (Month Day, Year)
});

const countOverallDelivery = ref(0);
const countOverallPickUp = ref(0);
const overallTotalDue = ref(0);
const overallTotalUnpaid = ref(0);
const overallExpenses = ref(0);

// For dynamically populated years and fixed months
const availableYears = ref([]);
const availableMonths = ref([
    "January", "February", "March", "April", "May", "June", "July", "August",
    "September", "October", "November", "December"
]); // Static months array
const selectedYear = ref('');
const selectedMonth = ref('');

// Fetch and process data based on selected month and year
const fetchMonthlyData = async () => {
    try {
        const { data } = await axios.get('/monthlySalesReport', {
            params: { filterYear: selectedYear.value, filterMonth: selectedMonth.value },
        });

        // If no data or no matching results, set all totals to zero
        if (!data.success || !data.results || data.results.length === 0) {
            countOverallDelivery.value = 0;
            countOverallPickUp.value = 0;
            overallTotalDue.value = 0;
            overallTotalUnpaid.value = 0;
            overallExpenses.value = 0;
            chartData.value = {
                labels: [],
                totalDue: [],
                totalQuantity: [],
                formattedDates: [],
            };
            createChart(); // Update chart with empty data
            return;
        }

        // Dynamically populate years from data.results
        const years = new Set();
        data.results.forEach((item) => {
            years.add(item.year);
        });
        availableYears.value = Array.from(years);

        // Set default selected values if not already set
        selectedYear.value = selectedYear.value || data.results[0]?.year || '';
        selectedMonth.value = selectedMonth.value || data.results[0]?.month || '';

        // Filter the results based on selected year and month before processing
        const filteredResults = data.results.filter(item =>
            item.month === selectedMonth.value && item.year === parseInt(selectedYear.value)
        );

        // If there are no results after filtering, reset values
        if (filteredResults.length === 0) {
            countOverallDelivery.value = 0;
            countOverallPickUp.value = 0;
            overallTotalDue.value = 0;
            overallTotalUnpaid.value = 0;
            overallExpenses.value = 0;
            chartData.value = {
                labels: [],
                totalDue: [],
                totalQuantity: [],
                formattedDates: [],
            };
            createChart(); // Update chart with empty data
            return;
        }

        // Store overall counts and expenses after filtering
        countOverallDelivery.value = data.countOverallDelivery;
        countOverallPickUp.value = data.countOverallPickUp;
        overallTotalDue.value = data.overallTotalDue;
        overallTotalUnpaid.value = data.overallTotalUnpaid;
        overallExpenses.value = parseInt(data.overallExpenses); // Expenses are a string, convert to number

        // Process filtered daily results for chart data
        chartData.value = {
            labels: filteredResults.map(day => day.day), // Day numbers
            totalDue: filteredResults.map(day => day.totalDue), // Total due values
            totalQuantity: filteredResults.map(day => day.totalQuantity), // Total quantity values
            formattedDates: filteredResults.map(
                day => `${day.month} ${day.day}, ${day.year}` // e.g., Dec 20, 2024
            ),
        };

        createChart(); // Render the chart with filtered data
    } catch (error) {
        console.error('Error fetching chart data:', error);
    }
};

// Create or update the chart
const createChart = () => {
    if (chartRef.value) {
        // Destroy the existing chart instance, if any
        chartInstance?.destroy();

        chartInstance = new Chart(chartRef.value, {
            type: 'line', // Line chart
            data: {
                labels: chartData.value.labels, // X-axis labels (Days of the month)
                datasets: [
                    {
                        label: 'Total Due (₱)',
                        data: chartData.value.totalDue,
                        backgroundColor: 'rgba(30, 144, 255, 0.1)', // Light blue fill
                        borderColor: '#1E90FF',
                        borderWidth: 2,
                        tension: 0.4, // Smooth curve
                        fill: true,
                        pointRadius: 5, // Hover dots
                        pointBackgroundColor: '#1E90FF',
                        pointBorderColor: '#FFFFFF',
                        pointHoverRadius: 7,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }, // Hide legend
                    tooltip: {
                        enabled: true, // Show tooltips on hover
                        callbacks: {
                            title: context => chartData.value.formattedDates[context[0].dataIndex], // Show Month Day, Year
                            label: context =>
                                `Quantity: ${chartData.value.totalQuantity[context.dataIndex]} | Total: ₱${context.raw.toLocaleString()}`,
                        },
                    },
                },
                onClick: (event, elements) => {
                    if (elements.length > 0) {
                        const index = elements[0].index; // Get clicked dot index
                        const formattedDate = chartData.value.formattedDates[index];
                        const quantity = chartData.value.totalQuantity[index];
                        const total = chartData.value.totalDue[index];

                        alert(`Details for ${formattedDate}:\nQuantity: ${quantity}\nTotal Due: ₱${total.toLocaleString()}`);
                    }
                },
                scales: {
                    x: {
                        grid: { display: false }, // Remove grid lines for X-axis
                        title: { display: false }, // Hide X-axis label
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: value => `₱${value.toLocaleString()}`, // Format values as currency
                        },
                        title: { display: false }, // Hide Y-axis label
                    },
                },
            },
        });
    }
};

// Watch for changes to the selected month or year and re-fetch data
watch([selectedMonth, selectedYear], fetchMonthlyData, { immediate: true });



const monthlysales = ref([])

const fetchAllMonthlySales = async () => {
    try {
        const response = await axios.get('/monthlySalesData', {
            params: {
                page: currentPage.value,
                limit: perPage.value,
            },
        });
        monthlysales.value = response.data.Results.map(monthlysale => {
            return {
                ...monthlysale,
                items: JSON.parse(`[${monthlysale.items}]`)
            };
        });
        console.log('Monthly Sales', monthlysales.value);



        totalDeliveries.value = response.data.TotalDeliveries;
        currentPage.value = response.data.currentPage;
        perPage.value = response.data.perPage;


        // Handle empty results when not on the first page
        if (dailysales.value.length === 0 && currentPage.value > 1) {
            currentPage.value--;
            fetchAllMonthlySales(); // Fetch updated page data
        }
    } catch (err) {
        console.error('Error Fetching Daily Sales:', err);
    }
};

//Pages
const currentPage = ref(0);
const perPage = ref(0); // Number of customers per page
const totalDeliveries = ref(0); // To track total customers for pagination

const goToPreviousPage = () => {
    if (currentPage.value > 1) {
        currentPage.value--;
        fetchAllMonthlySales();
    }
};

const goToNextPage = () => {
    const totalPages = Math.ceil(totalDeliveries.value / perPage.value); // Calculate total pages
    if (currentPage.value < totalPages) {
        currentPage.value++;
        fetchAllMonthlySales();
    }
};







// Fetch data on mount
onMounted(() => {
    fetchMonthlyData();
    fetchAllMonthlySales();
});
</script>

<template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen   xl:h-screen h-[680px]  overflow-y-auto">
        <headerComponent />
        <!-- start of monthly sales report header -->
        <div class="mt-10 ml-10 flex">
            <img class="w-[27px] h-5 mt-1  mr-3" src="../assets/monthlysales.png" alt="">
            <h1 class="font-normal leading-normal text-lg">MONTHLY SALES REPORT</h1>
        </div>
        <div>
            <div class="mt-5 mx-3 mb-5">
                <div class="border-b  w-full"></div>
            </div>
        </div>
        <!-- end of monthly sales report -->

        <div class="flex justify-center">
            <section class="lg:w-[95%] xl:w-[95%] w-[90%]  border mt-2 h-[80%] rounded-md shadow-md">
                <div class="lg:flex xl:flex mt-3 mx-3 justify-center mb-2">
                    <div class=" flex w-full py-1">
                        <div class="mt-2  mr-2 w-full">
                            <label class="flex justify-center">DELIVER</label>
                            <div class="flex justify-center">
                                <span>{{ countOverallDelivery || 0 }}</span>
                            </div>
                        </div>
                        <div class="mt-2  mr-2 w-full">
                            <label class="flex justify-center">PICK UP</label>
                            <div class="flex justify-center">
                                <span>{{ countOverallPickUp || 0 }}</span>
                            </div>
                        </div>
                        <div class=" mt-2  mr-2 w-full">
                            <label class="flex justify-center">SALES</label>
                            <div class="flex justify-center">
                                <span>{{ overallTotalDue || 0 }}</span>
                            </div>

                        </div>
                        <div class=" mt-2  mr-2 w-full">
                            <label class="flex justify-center">UNPAID</label>
                            <div class="flex justify-center">
                                <span>{{ overallTotalUnpaid || 0 }}</span>
                            </div>

                        </div>
                        <div class=" mt-2  mr-2 w-full">
                            <label class="flex justify-center">EXPENSES</label>
                            <div class="flex justify-center">
                                <span>{{ overallExpenses || 0 }}</span>
                            </div>
                        </div>

                    </div>
                    <div class="w-[40%]"></div>
                    <div class="lg:w-[60%] xl:w-[60%] w-full flex">
                        <div class="w-full mt-2 mr-2">
                            <label for="month">MONTH</label>
                            <select class="border border-black py-1 w-full px-1 flex-shrink-0 rounded-md shadow-md"
                                v-model="selectedMonth">
                                <option v-for="month in availableMonths" :key="month" :value="month">{{ month }}
                                </option>
                            </select>
                        </div>
                        <div class="w-full mt-2">
                            <label for="year">YEAR</label>
                            <select class="border border-black py-1 px-1 w-full flex-shrink-0 rounded-md shadow-md"
                                v-model="selectedYear">
                                <option v-for="year in availableYears" :key="year" :value="year">{{ year }}</option>
                            </select>
                        </div>
                    </div>

                </div>
                <div class="flex justify-center">
                    <div class="lg:w-[97%] xl:w-[95%] w-[96%] h-[550px] lg:h-[550px]  xl:h-[550px] py-2">
                        <canvas ref="chartRef"></canvas>
                    </div>
                </div>
            </section>
        </div>

        <div class="flex justify-center mt-3">
            <!-- <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 lg:h-[590px] xl:h-[590px] h-[588px] rounded-md shadow-md">
                <section>
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border lg:h-[540px] xl:h-[540px] h-[540px]">
                            <table class=" w-full bg-[#4E95C9]">
                                <thead class="whitespace-nowrap">
                                    <tr>
                                        <th class="px-5 py-4 text-left text-xs font-semibold  uppercase tracking-wider">
                                            #
                                        </th>
                                        <th
                                            class="px-[100px] text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center items-center">
                                                DATE
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>

                                        </th>
                                        <th
                                            class="px-[15px] py-3 text-left text-xs font-semibold  uppercase tracking-wider">
                                            <div class="flex justify-center  items-center ml-7">
                                                SERVICES
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-3"></div>
                                                QTY
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>
                                                TOTAL
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>

                                                UNPAID
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>

                                                EXPENSES
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>

                                        <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>

                                                NET
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>


                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                <div class="mx-4"></div>

                                                INCHARGE
                                                <svg class="mx-1" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>

                                    </tr>
                                </thead>
                                <tbody class="bg-white  whitespace-nowrap">
                                    <tr class="border-b border-gray-300" v-if="monthlysales.length > 0"
                                        v-for="(monthlysale, index) in monthlysales" :key="monthlysale.transaction_id">
                                        <td class="px-4 w-2 py-4 text-sm text-gray-800">
                                            {{ monthlysale.transaction_id }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm uppercase text-gray-800">
                                            {{ format(new Date(monthlysale.transaction_date), 'MMMM dd, yyyy') }}
                                        </td>
                                        <td class="px-4 w-2 py-4 text-center text-sm uppercase text-gray-800">
                                            <div class="flex">
                                                <div class="mr-2"><i class="fas fa-hand-holding mr-2"></i>{{
                                                    monthlysale.totalPickUp }}</div>
                                                <div class="mr-2"> <i class="fas fa-truck mr-2"></i> {{
                                                    monthlysale.totalPickUp }}</div>
                                                <div class="mr-2"> <i class="fas fa-tag mr-2"></i> {{
                                                    monthlysale.totalFree }}</div>
                                            </div>
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.totalQuantity }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.totalTotalDue }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.totalUnpaid }}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.totalExpenses}}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.netSales}}
                                        </td>
                                        <td class="px-4 py-4 text-center text-sm text-gray-800">
                                            {{ monthlysale.transaction_user_firstname }} {{
                                                monthlysale.transaction_user_lastname }}
                                        </td>
                                    </tr>
                                    <tr v-else>
                                        <td colspan="9" class="py-4 text-center text-gray-500 text-xl font-semibold">
                                            No monthly sales available.
                                        </td>
                                    </tr>
                                </tbody>

                            </table>
                            
                        </div>
                <div
                    class=" flex justify-center py-2">
                    <svg @click="goToPreviousPage" class="bg-gray-200 border-l rounded-l-full " width="40" height="30"
                        viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M11.707 7.05451C11.8945 7.24203 11.9998 7.49634 11.9998 7.76151C11.9998 8.02667 11.8945 8.28098 11.707 8.4685L7.414 12.7615L11.707 17.0545C11.8892 17.2431 11.99 17.4957 11.9877 17.7579C11.9854 18.0201 11.8802 18.2709 11.6948 18.4563C11.5094 18.6417 11.2586 18.7469 10.9964 18.7492C10.7342 18.7515 10.4816 18.6507 10.293 18.4685L5.293 13.4685C5.10553 13.281 5.00021 13.0267 5.00021 12.7615C5.00021 12.4963 5.10553 12.242 5.293 12.0545L10.293 7.05451C10.4805 6.86703 10.7348 6.76172 11 6.76172C11.2652 6.76172 11.5195 6.86703 11.707 7.05451ZM17.707 7.05451C17.8945 7.24203 17.9998 7.49634 17.9998 7.76151C17.9998 8.02667 17.8945 8.28098 17.707 8.4685L13.414 12.7615L17.707 17.0545C17.8892 17.2431 17.99 17.4957 17.9877 17.7579C17.9854 18.0201 17.8802 18.2709 17.6948 18.4563C17.5094 18.6417 17.2586 18.7469 16.9964 18.7492C16.7342 18.7515 16.4816 18.6507 16.293 18.4685L11.293 13.4685C11.1055 13.281 11.0002 13.0267 11.0002 12.7615C11.0002 12.4963 11.1055 12.242 11.293 12.0545L16.293 7.05451C16.4805 6.86703 16.7348 6.76172 17 6.76172C17.2652 6.76172 17.5195 6.86703 17.707 7.05451Z"
                            fill="#555555" />
                    </svg>

                    <span class="bg-[#4E95C9] px-3 pt-1 hover:text-white ">{{ currentPage }}</span>

                    <svg @click="goToNextPage" class="bg-gray-200 border-r rounded-r-full" width="40" height="30"
                        viewBox="0 0 26 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd" clip-rule="evenodd"
                            d="M13.2024 18.473C13.0179 18.2825 12.9166 18.0265 12.9208 17.7614C12.9251 17.4963 13.0344 17.2437 13.2248 17.0591L17.5854 12.8348L13.361 8.47422C13.1818 8.28275 13.0851 8.02858 13.0915 7.76645C13.0979 7.50432 13.2071 7.25521 13.3954 7.07277C13.5837 6.89032 13.8362 6.78914 14.0984 6.79102C14.3606 6.7929 14.6115 6.89769 14.7972 7.08282L19.7173 12.1615C19.9018 12.352 20.003 12.6079 19.9988 12.873C19.9946 13.1382 19.8853 13.3908 19.6949 13.5753L14.6162 18.4954C14.4257 18.6799 14.1698 18.7811 13.9047 18.7769C13.6395 18.7727 13.3869 18.6634 13.2024 18.473ZM7.20314 18.3778C7.01867 18.1873 6.9174 17.9314 6.9216 17.6662C6.92581 17.4011 7.03514 17.1485 7.22557 16.964L11.5861 12.7396L7.36173 8.37906C7.18259 8.1876 7.08581 7.93343 7.09225 7.6713C7.09868 7.40917 7.20782 7.16006 7.39614 6.97761C7.58447 6.79517 7.83692 6.69399 8.09912 6.69587C8.36132 6.69775 8.61229 6.80254 8.79798 6.98766L13.7181 12.0663C13.9025 12.2568 14.0038 12.5128 13.9996 12.7779C13.9954 13.043 13.8861 13.2956 13.6956 13.4802L8.61696 18.4002C8.42649 18.5847 8.17054 18.686 7.90541 18.6818C7.64028 18.6776 7.38767 18.5682 7.20314 18.3778Z"
                            fill="#555555" />
                    </svg>
                    </div>
                    </div>
                </section>
            </section> -->
        </div>
        <yearlySalesReportComponent />

        <footerComponent class="mt-3" />

    </main>
</template>