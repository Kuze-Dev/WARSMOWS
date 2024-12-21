<script setup>
import { Chart, registerables } from 'chart.js';
import axios from '../../axios';
import { ref, onMounted } from 'vue';

Chart.register(...registerables);

const chartRef = ref(null); // Reference for the canvas
let chartInstance = null;

const chartData = ref({
  labels: [], // These will now be months
  totalDue: [],
  totalQuantity: [],
  formattedDates: [], // This will store formatted month names
});

const countOverallDelivery = ref(0);
const countOverallPickUp = ref(0);
const overallTotalDue = ref(0);
const overallTotalUnpaid = ref(0);
const overallExpenses = ref(0);

const availableYears = ref([]);

const selectedYear = ref('');
const selectedMonth = ref('');

// Fetch and process data based on selected year
const fetchYearlyData = async () => {
  try {
    const { data } = await axios.get('/yearlySalesReport', {
      params: { filterYear: selectedYear.value },
    });

    if (!data.success || !data.results || data.results.length === 0) {
      resetData();
      return;
    }

    // Dynamically populate years from data.results
    const years = new Set();
    data.results.forEach((item) => {
      years.add(item.year);
    });
    availableYears.value = Array.from(years);

    // Set default selected year if not already set
    selectedYear.value = selectedYear.value || data.results[0]?.year || '';

    // Store overall counts and expenses after filtering
    countOverallDelivery.value = data.countOverallDelivery;
    countOverallPickUp.value = data.countOverallPickUp;
    overallTotalDue.value = data.overallTotalDue;
    overallTotalUnpaid.value = data.overallTotalUnpaid;
    overallExpenses.value = parseInt(data.overallExpenses);

    // Process monthly results for chart data
    chartData.value = {
      labels: data.results.map(item => item.month), // Use month names as labels
      totalDue: data.results.map(item => item.totalDue),
      totalQuantity: data.results.map(item => item.totalQuantity),
      formattedDates: data.results.map(item => `${item.month}, ${item.year}`),
    };

    createChart(); // Render the chart with filtered data
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
};

// Reset data
const resetData = () => {
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
  createChart();
};

// Create or update the chart
const createChart = () => {
  if (chartRef.value) {
    // Destroy the existing chart instance, if any
    chartInstance?.destroy();

    chartInstance = new Chart(chartRef.value, {
      type: 'line', // Line chart
      data: {
        labels: chartData.value.labels, // X-axis labels (Months)
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
              title: context => chartData.value.formattedDates[context[0].dataIndex], // Show Month, Year
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

// Fetch data on mount
onMounted(fetchYearlyData);
</script>




<template>
     <!-- start of yearly sales report header -->
     <div class="mt-10 ml-10 flex">
        <img class="w-[27px] h-5 mt-1  mr-3" src="../assets/monthlysales.png" alt="">
        <h1 class="font-normal leading-normal text-lg">YEARLY SALES REPORT</h1>
    </div>

            <div>
                <div class="mt-5 mx-3 mb-5">
                    <div class="border-b  w-full"></div>
                </div>
             </div>
             <!-- end of yearly sales report header -->
              
            <div class="flex justify-center">
            <section class="lg:w-[95%] xl:w-[95%] w-[90%]   border mt-2 h-[80%] rounded-md shadow-md">
                <div class="lg:flex xl:flex mt-3 mx-3 justify-center mb-2">
            <div class=" flex w-[80%] py-1">
                <div class="mt-2  mr-2 w-full">
                    <label class="flex justify-center" >DELIVER</label>
                    <div class="flex justify-center">
                    <span>{{ countOverallDelivery||0 }}</span>
                </div>
                </div>
                <div class="mt-2  mr-2 w-full">
                    <label class="flex justify-center"  >PICK UP</label>
                    <div class="flex justify-center">
                    <span>{{ countOverallPickUp||0 }}</span>
                </div>
                </div>
                <div class=" mt-2  mr-2 w-full">
                    <label class="flex justify-center" >SALES</label>
                    <div class="flex justify-center">
                    <span>{{ overallTotalDue||0  }}</span>
                </div>

                </div>
                <div class=" mt-2  mr-2 w-full">
                    <label class="flex justify-center"  >UNPAID</label>
                    <div class="flex justify-center">
                    <span>{{ overallTotalUnpaid||0 }}</span>
                </div>

                </div>
                <div class=" mt-2  mr-2 w-full">
                    <label class="flex justify-center">EXPENSES</label>
                    <div class="flex justify-center">
                    <span>{{overallExpenses||0 }}</span>
                </div>
                </div>
           
            </div>
            <div class="w-[40%]"></div>
            <div class="lg:w-[30%] xl:w-[60%] w-full flex">
                
            <div class="w-full mt-2">
              <label for="year">YEAR</label>
              <select
                class="border border-black py-1 px-1 w-full flex-shrink-0 rounded-md shadow-md"
                v-model="selectedYear"
              >
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

            <div class="flex justify-center">
                
      <!-- <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 h-screen rounded-md shadow-md">
         <section class="mt-2">
                    <div class="w-full  h-[270px]">
                        <div class="font-[sans-serif] overflow-x-auto border pb-[85px]">
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
                                                
                                                QTY
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
                                                TOTAL
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
                                                UNPAID
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
                                                EXPENSES
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
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
                                                NET
                                                <svg class="ml-2" width="21" height="20" viewBox="0 0 21 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>


                                        <th
                                            class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                            <div class="flex justify-center items-center">
                                                INCHARGE
                                                <svg class="mx-2" width="21" height="20" viewBox="0 0 21 20" fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M2.625 7.69157L6.125 4.5249M6.125 4.5249L9.625 7.69157M6.125 4.5249V15.6082M18.375 12.4416L14.875 15.6082M14.875 15.6082L11.375 12.4416M14.875 15.6082V4.5249"
                                                        stroke="#555555" stroke-width="2" stroke-linecap="round"
                                                        stroke-linejoin="round" />
                                                </svg>
                                            </div>
                                        </th>
                                        <th class="px-4 py-3 text-left text-xs font-semibold  uppercase tracking-wider ">
                                         
                                        </th>
                                    </tr>
                                </thead>
                                
                            </table>
                        </div>
                    </div>
                </section>
      </section>   -->
    </div>
</template>