
<script setup>
import headerComponent from '../components/headerComponent.vue';
import footerComponent from '../components/footerComponent.vue';
import { Chart, registerables } from 'chart.js';
import axios from '../../axios';
import { ref, onMounted, watch} from 'vue';

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
      params: { filterYear: selectedYear.value,filterMonth: selectedMonth.value },
    });

    // Store overall counts and expenses
    countOverallDelivery.value = data.countOverallDelivery;
    countOverallPickUp.value = data.countOverallPickUp;
    overallTotalDue.value = data.overallTotalDue;
    overallTotalUnpaid.value = data.overallTotalUnpaid;
    overallExpenses.value = data.overallExpenses;

    if (data.success) {
      // Dynamically populate years from data.results
      const years = new Set();
      data.results.forEach((item) => {
        years.add(item.year);
      });
      availableYears.value = Array.from(years);

      // Set default selected values if not already set
      selectedYear.value = selectedYear.value || data.results[0]?.year || '';
      selectedMonth.value = selectedMonth.value || data.results[0]?.month || '';

      // Filter the results based on selected year and month
      const filteredResults = data.results.filter(item =>
        item.month === selectedMonth.value && item.year === parseInt(selectedYear.value)
      );

      // Process filtered daily results for chart data
      chartData.value = {
        labels: filteredResults.map(day => day.day), // Day numbers
        totalDue: filteredResults.map(day => day.totalDue), // Total due values
        totalQuantity: filteredResults.map(day => day.totalQuantity), // Total quantity values
        formattedDates: filteredResults.map(
          day => `${day.month} ${day.day}, ${day.year}` // e.g., Dec 20, 2024
        ),
      };

      createChart(); // Render the chart
    }
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


// Fetch data on mount
onMounted(fetchMonthlyData);
</script>
<template>
<main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen   xl:h-screen h-[680px]  overflow-y-auto">
    <headerComponent/>
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
            <div class="lg:w-[60%] xl:w-[60%] w-full flex">
                <div class="w-full mt-2 mr-2">
              <label for="month">MONTH</label>
              <select 
                class="border border-black py-1 w-full px-1 flex-shrink-0 rounded-md shadow-md"
                v-model="selectedMonth"
              >
                <option  v-for="month in availableMonths"  :key="month" :value="month">{{ month }}</option>
              </select>
            </div>
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
      <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 h-screen rounded-md shadow-md">
         <!--Start of Table -->
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
      </section>  
    </div>
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
            <section class="lg:w-[95%] xl:w-[95%] w-[90%]  border mt-2 h-screen rounded-md shadow-md">
            
            </section>  
            </div>

            <div class="flex justify-center">
                
      <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 h-screen rounded-md shadow-md">
         <!--Start of Table -->
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
      </section>  
    </div>
    
    <footerComponent class="mt-3" />

</main>
</template>