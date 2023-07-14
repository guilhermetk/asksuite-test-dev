const BrowserService = require("../services/BrowserService");

const ROOMS_AVAILABLE_SELECTOR = ".row-quarto";
const NO_AVAILABILITY_SELECTOR = "#hotel-selecionado-indisponivel";
const ROOM_NAME_SELECTOR = ".quartoNome";
const ROOM_DESCRIPTION_SELECTOR = ".quartoDescricao";
const ROOM_PRICE_SELECTOR = ".valorFinal";
const ROOM_IMAGE_SELECTOR = ".room--image";

exports.scrape = async (checkin, checkout) => {
  const browser = await BrowserService.getBrowser();
  const page = await navigateToPage(browser, checkin, checkout);

  const roomsAvailable = await checkForRoomsAvailability(page);
  if (roomsAvailable.length === 0) {
    const error = new Error("No rooms found, try again with different dates.");
    error.statusCode = 422;
    BrowserService.closeBrowser(browser);
    throw error;
  }

  const availableRooms = await extractRoomsData(roomsAvailable);
  BrowserService.closeBrowser(browser);
  return availableRooms;
};

async function checkForRoomsAvailability(page) {
  //EITHER WAITS FOR THE ROOM'S AVAILABLE TABLE OR THE NO AVAILABILITY MODAL
  await page.waitForSelector(
    `${ROOMS_AVAILABLE_SELECTOR}, ${NO_AVAILABILITY_SELECTOR}`
  );
  const roomsTable = await page.$$(ROOMS_AVAILABLE_SELECTOR);
  return roomsTable;
}

async function navigateToPage(browser, checkin, checkout) {
  const page = await browser.newPage();
  const URL = `https://pratagy.letsbook.com.br/D/Reserva?checkin=${checkin}&checkout=${checkout}&cidade=&hotel=12&adultos=2&criancas=&destino=Pratagy+Beach+Resort+All+Inclusive&promocode=&tarifa=&mesCalendario=7%2F14%2F2023`;
  await page.goto(URL);
  return page;
}

async function extractRoomsData(roomsTable) {
  return await Promise.all(
    roomsTable.map(async (room) => {
      return {
        name: await room.$eval(ROOM_NAME_SELECTOR, (node) => {
          return node.textContent;
        }),
        description: await room.$eval(ROOM_DESCRIPTION_SELECTOR, (node) => {
          return node.firstElementChild.textContent;
        }),
        price: await room.$eval(ROOM_PRICE_SELECTOR, (node) => {
          return node.textContent;
        }),
        image: await room.$eval(ROOM_IMAGE_SELECTOR, (node) => {
          return node.getAttribute("data-src");
        }),
      };
    })
  );
}
