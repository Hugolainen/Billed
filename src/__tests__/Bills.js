import { screen } from "@testing-library/dom"
import userEvent from "@testing-library/user-event";
import { ROUTES } from "../constants/routes";

import { bills } from "../fixtures/bills.js"
import { localStorageMock } from "../__mocks__/localStorage"
import firebase from "../__mocks__/firebase"

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
      onNavigate = (pathname) => {document.body.innerHTML = ROUTES({ pathname })}

      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({type: 'Employee'}))
      
      document.body.innerHTML = BillsUI({ data: bills });

      container = new Bills({
        document,
        onNavigate,
        firestore,
        localStorage: window.localStorage,
      })
    })

    test("Then bill icon in vertical layout should be highlighted", () => {
      document.body.innerHTML = BillsUI({ data: bills});
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
        expect(screen.getByTestId("icon-mail").classList.contains("active-icon")).toBeTruthy;
      })
    })

    describe("When I click on the 'Eye' Icon of a bill", () => {
      test("Then the bill should be shown in a modal", () => {
        document.body.innerHTML = BillsUI({ data: bills });
        $.fn.modal = jest.fn();

        const iconEyeList = screen.getAllByTestId("icon-eye");
        const iconEyeBtn = iconEyeList[0];

        const modalTrigger = jest.fn(container.handleClickIconEye);
        iconEyeBtn.addEventListener("click", () => {modalTrigger(iconEyeBtn);});
        
        userEvent.click(iconEyeBtn);
        expect(modalTrigger).toHaveBeenCalled();
        expect($.fn.modal).toHaveBeenCalledWith("show");
  
        const modal = screen.getByTestId("modaleFile");
        expect(modal).toBeTruthy();
        
        const modalTitle = screen.getByText("Fee");
        expect(modalTitle).toBeTruthy();

        const modalImageUrl = iconEyeBtn.getAttribute("data-bill-url").split("?")[0];
        expect(modal.innerHTML.includes(modalImageUrl)).toBeTruthy();
      })
    })
  })
})

// Integration tests of the data (bills) fetching (API GET call)
describe("Given I am a user connected as Employee", () => {
  describe("When BillsUI is called", () => {
    test("Then the bills should be fetched from API", async () => {
      const spy = jest.spyOn(firebase, "get");
      const bills = await firebase.get();
      expect(spy).toHaveBeenCalledTimes(1);
      expect(bills.data.length).toBe(4);
    })
    describe("When the API fails with a 404 error message", () => {
      test("Then a 404 error message should be displayed", async () => {
        firebase.get.mockImplementationOnce(() => {
          Promise.reject(new Error("Error 404"));
        });
        document.body.innerHTML = BillsUI({ error: "Error 404" });
        const message = await screen.getByText(/Error 404/);
        expect(message).toBeTruthy();
      })
    })

    describe("When the API fails with a 500 error message", () => {
      test("Then a 500 error message should be displayed", async () => {
        firebase.get.mockImplementationOnce(() =>
          Promise.reject(new Error("Error 500"))
        );
        document.body.innerHTML = BillsUI({ error: "Error 500" });
        const message = await screen.getByText(/Error 500/);
        expect(message).toBeTruthy();
      })
    })
  })
})