import { ROUTES_PATH } from '../constants/routes.js'
import Logout from "./Logout.js"

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const formNewBill = this.document.querySelector(`form[data-testid="form-new-bill"]`)
    formNewBill.addEventListener("submit", this.handleSubmit)
    const file = this.document.querySelector(`input[data-testid="file"]`)
    file.addEventListener("change", this.handleChangeFile)
    this.fileUrl = null
    this.fileName = null
    this.billId = null
    new Logout({ document, localStorage, onNavigate })
  }
  
  handleChangeFile = e => {
    e.preventDefault()
    console.log('1 e ==========', e)
    console.log('1-1 e.target ==========', e.target)
    console.log('1-2 e.target.value ==========', e.target.value)
    const input = this.document.querySelector(`input[data-testid="file"]`)
    console.log('2 e.target === input >>>', e.target === input)
    console.log('4 e.target.value ==========', e.target.value)

    console.log('5 input', input )
    const file = input.files[0]
    console.log('6 file', file)
    const filePath = e.target.value.split(/\\/g)
    console.log('7 filePath', filePath )
    const fileName = filePath[filePath.length-1] 
    console.log('8 fileName', fileName )
    
    const fileNameSplit = fileName.split('.')
    console.log('9 fileNameSplit', fileNameSplit )
    const fileNameExtension = fileNameSplit[fileNameSplit.length-1]
    console.log('10 fileNameExtension', fileNameExtension)
    const isValidFileNameExtension = ['jpg', 'jpeg', 'png']
    console.log('11 isValidFileNameExtension', isValidFileNameExtension )
    // const isValidFileNameExtension = /.+png$|.+jpeg$|.+jpg$/i;

    const errorMessage = this.document.querySelector(".new-bill_input-file_extension-error-message")
    console.log('12 errorMessage', errorMessage)

    if (!isValidFileNameExtension.includes(fileNameExtension)) {
      input.value = null
      errorMessage.classList.remove('hidden')
      console.log('----------------IF-------------------')
      return
    } 
    console.log('!!!!!!!!!!!!!!!!!!!!!ELSE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    errorMessage.classList.add('hidden')
    

     // TODO si bon format mais pas de validation, apparait en null dans les notes de frais

    const formData = new FormData() // créer un objet formData avec paires key/value
    const email = JSON.parse(localStorage.getItem("user")).email //extrait l'objet 
    console.log(email)
    console.log(file)

    formData.append('file', file) //.append ajoute à l'objet formData key/value
    formData.append('email', email)
    console.log(formData)

    this.store // app/store.js >>> crée une bills avec le fichier et l'email et .then renvoie une 
      .bills() 
      .create({ //appelle create (class ApiEntity) avec un objet bills, bills est une instance de ApiEntity
        data: formData,
        headers: {
          noContentType: true
        }
      })
      .then(({fileUrl, key}) => {
        // console.log(fileUrl)
        this.billId = key  
        this.fileUrl = fileUrl
        this.fileName = fileName
      }).catch(error => console.error(error))
  }
  handleSubmit = e => {
    e.preventDefault()
    // console.log('e.target.querySelector(`input[data-testid="datepicker"]`).value', e.target.querySelector(`input[data-testid="datepicker"]`).value)
    const email = JSON.parse(localStorage.getItem("user")).email
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name:  e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(e.target.querySelector(`input[data-testid="amount"]`).value),
      date:  e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct: parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) || 20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`).value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: 'pending'
    }
    this.updateBill(bill)
    this.onNavigate(ROUTES_PATH['Bills'])
  }

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
      .bills()
      .update({data: JSON.stringify(bill), selector: this.billId})
      .then(() => {
        this.onNavigate(ROUTES_PATH['Bills'])
      })
      .catch(error => console.error(error))
    }
  }
}
