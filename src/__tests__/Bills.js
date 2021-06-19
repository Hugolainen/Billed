import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import { ROUTES, ROUTES_PATH } from "../constants/routes";

import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage"

import firestore from '../app/Firestore'

import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import LoadingPage from "../views/LoadingPage.js";
import ErrorPage from "../views/ErrorPage.js";

describe("Given I am connected as an employee", () => {
  describe("When BillsUI is called", () => {
    describe("When the page is loading", () => {
      test("Then the Loading page should be rendered", () => {
        const reference = LoadingPage();
        const toTest = BillsUI({ data: bills, loading: true });
        expect(toTest).toEqual(reference);
      })
    })
    describe("When the backend throws an error", () => {
      test("Then the Error page should be rendered", () => {
        const error = "Something went bad";
        const reference = ErrorPage(error);
        const toTest = BillsUI({ data: bills, loading: false, error});
        expect(toTest).toEqual(reference);
      })
    })
  })
  
  describe("When I am on Bills Page", () => {
    let onNavigate;
    let container;
    beforeEach(() => {
        onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname })
    }

       Object.defineProperty(window, 'localStorage', { value: localStorageMock })
       window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))

       container = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage,
      })
    })

    test("Then bill icon in vertical layout should be highlighted", () => {
      const html = BillsUI({ data: bills})
      document.body.innerHTML = html
      expect(screen.getByTestId("icon-window").classList.contains("active-icon")).toBeTruthy;
    })
      
    test("Then bills should be ordered from earliest to latest", () => {
      const html = BillsUI({ data: bills })
      document.body.innerHTML = html
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a < b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })

    describe("When I click on the NewBill button", () => {
      test("Then the new bill form page should be rendered", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const newBill_btn = screen.getByTestId("btn-new-bill");

        onNavigate = jest.fn();
        const formTrigger = jest.fn(container.handleClickNewBill);
        
        newBill_btn.addEventListener("click", formTrigger);
        userEvent.click(newBill_btn);

        expect(formTrigger).toHaveBeenCalled();
        expect(screen.getAllByText("Send a fee")).toBeTruthy();
        expect(screen.getByTestId("form-new-bill") !== undefined).toBeTruthy();
      })
    })

    describe("When I click on the 'Eye' Icon of a bill", () => {
      test("Then the bill should be shown in a modal", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        const eyeIcon_btn = screen.getAllByTestId("icon-eye")[0];
        //const eyeIcon_btn = eyeIcon_btnList[0];

        onNavigate = jest.fn();
        const modaleTrigger = jest.fn(container.handleClickIconEye);

        eyeIcon_btn.addEventListener("click", modaleTrigger(eyeIcon_btn));
        userEvent.click(eyeIcon_btn);
        expect(modaleTrigger).toHaveBeenCalled();

        const modal = screen.getByTestId("modaleFile");
        expect(modal).toBeTruthy();

        const modalImageUrl = eyeIcon_btn.getAttribute("data-bill-url").split("?")[0];
        expect(modal.innerHTML.includes(modalImageUrl)).toBeTruthy();
        
        const modalTitle = screen.getByText("Fee");
        expect(modalTitle).toBeTruthy();
      })
    })
  })
})