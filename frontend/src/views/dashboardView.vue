<script setup>
import { ref, onMounted } from 'vue';
import { Chart, registerables } from 'chart.js';
import axios from '../../axios'; // Import Axios
import headerComponent from '../components/headerComponent.vue'; // Import components
import footerComponent from '../components/footerComponent.vue';
import dashboardComponent from '../components/dashboardComponent.vue';

Chart.register(...registerables);

const chartRef = ref(null); // Reference for the canvas
let chartInstance = null;

const chartData = ref({
  labels: [], // Days of the month
  totalDue: [], // Total Due per day
  totalQuantity: [], // Total Quantity per day
  formattedDates: [], // Formatted dates for tooltip (Month Day, Year)
});

const fetchChartData = async () => {
  try {
    const { data } = await axios.get('/salesanalytics'); // API endpoint

    if (Array.isArray(data)) {
      chartData.value = {
        labels: data.map(day => day.day), // Day numbers
        totalDue: data.map(day => day.totalDue), // Total due values
        totalQuantity: data.map(day => day.totalQuantity), // Total quantity values
        formattedDates: data.map(
          day => `${day.month} ${day.day}, ${day.year}` // e.g., Nov 20, 2019
        ),
      };

      createChart(); // Render the chart
    }
  } catch (error) {
    console.error('Error fetching chart data:', error);
  }
};

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

// Fetch chart data and initialize chart on mount
onMounted(fetchChartData);
</script>







    <template>
    <main class="lg:w-[1200px] xl:w-[1310px] w-full lg:h-screen xl:h-screen h-screen overflow-y-auto">
        <headerComponent />
        <dashboardComponent />

        <!-- Navigation -->
        <div class="flex justify-center">
        <section class="lg:w-[95%] xl:w-[95%] w-[90%] border mt-2 lg:h-[650px] xl:h-[650px] h-[800px] rounded-md shadow-md">
            <div class="lg:flex mx-3 my-2 space-y-4 lg:space-y-0 lg:space-x-7">
                <div class="" >
            <RouterLink to="/" class="flex">
                <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/salesanalytics.png" alt="" />
                <span class="mt-3 font-bold">SALES ANALYTICS</span>
            </RouterLink>
            <div class="relative top-5">
                                <div class="border-b-2 border-black"></div>
                            </div>
            </div>
            <RouterLink to="/salessummary" class="flex mt-2">
                <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/salessummary.png" alt="" />
                <span class="mt-3">SALES SUMMARY</span>
            </RouterLink>
            <RouterLink to="/dailysales" class="flex mt-2">
                <img class="w-[25px] h-7 mt-2 mr-2" src="../assets/dailysales.png" alt="" />
                <span class="mt-3">DAILY SALES</span>
            </RouterLink>
            <RouterLink to="/newcustomer" class="flex mt-2">
                <img class="w-[28px] h-5 mt-4 mr-2" src="../assets/newcustomer.png" alt="" />
                <span class="mt-3">NEW CUSTOMER</span>
            </RouterLink>
            </div>

            <!-- Divider -->
            <div class="mt-5 mx-3">
            <div class="border-b w-full"></div>
            </div>

            <!-- Chart -->
            <div class="mt-2 flex justify-center items-center">
            <div class="lg:w-[97%] xl:w-[95%] w-[96%] h-[550px] lg:h-[550px]  xl:h-[550px]">
                <canvas ref="chartRef"></canvas>
            </div>
            </div>
        </section>
        </div>

        <footerComponent class="mt-3" />
    </main>
    </template>

    <style scoped>
    /* Additional styles for matching design */
    canvas {
    background: white; /* Light background for better contrast */
    }
    </style>
