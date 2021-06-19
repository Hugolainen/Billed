import { screen } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage"
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes";
import firebase from "../__mocks__/firebase";
import userEvent from "@testing-library/user-event";
import firestore from '../app/Firestore'

const mockBill = 
[
  {
    id: "47qAXb6fIm2zOKkLzMro",
    vat: "80",
    fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
    status: "pending",
    type: "Hôtel et logement",
    commentary: "séminaire billed",
    name: "encore",
    fileName: "preview-facture-free-201801-pdf-1.jpg",
    date: "2004-04-04",
    amount: 400,
    commentAdmin: "ok",
    email: "a@a",
    pct: 20,
  },
]

describe("Given I am connected as an employee", () => {
  describe("when BillsUI is called", () => {
    test("Then the Loading page should be rendered when loading = TRUE", () => {
      const reference = LoadingPage();
      const toTest = BillsUI({ data: bills, loading: true });
      expect(toTest).toEqual(reference);
    });

    test("Then the Error page should be rendered when loading = FALSE & error = TRUE", () => {
      const error = "Something went bad";
      const reference = ErrorPage(error);
      const toTest = BillsUI({ data: bills, loading: false, error});
      expect(toTest).toEqual(reference);
    });
  });
  
  describe("When I am on Bills Page", () => {
    let onNavigate;
    beforeEach(() => {
        onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
      }

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
    })

    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy;
    });
        
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    });

    describe("When I click on the NewBill button", () => {
      test("Then the NewBill form should be rendered", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        onNavigate = jest.fn();
        new Bills({
          document,
          onNavigate,
          firestore,
          localStorage,
        });
        const newBill_btn = screen.getByTestId("btn-new-bill");
        userEvent.click(newBill_btn);
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["NewBill"]);

        const data = [];
        const loading = false;
        const error = null;
        const pathname = ROUTES_PATH["NewBill"];
        const newBillHtml = ROUTES({ pathname, data, loading, error });
        document.body.innerHTML  = newBillHtml;
        expect(screen.getAllByText("Send a fee")).toBeTruthy();
      });
    });

    describe("When I click on the 'Eye' Icon of a bill", () => {
      test("Then the bill should be shown in a modal", () => {
        $.fn.modal = jest.fn();
        document.body.innerHTML = BillsUI({ data: mockBill });
        const billsClass = new Bills({
          document,
          onNavigate,
          firestore,
          localStorage,
        });

        const eyeIcon_btn = screen.getByTestId("icon-eye");
        userEvent.click(eyeIcon_btn);
        expect($.fn.modal).toHaveBeenCalledWith("show");

        const billImgModal = screen.getByText("Fee");
        expect(billImgModal).toBeTruthy();
      });
    });
  });


})