import React, { Component } from "react";
import CoffeeContract from "./contracts/Coffee.json";
import getWeb3 from "./getWeb3";

import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css';

class ListUserTokens extends Component {
    render() {
        try {
            const listTokens = this.props.userTokens.map((coffee, index) => (
                <div className="col-sm-6 col-md-4 col-lg-3 float-left" key={ index }>
                    <div className="panel panel-default panel-coffee">
                        <div className="panel-body">
                            <strong><span className="coffee">{coffee.name}</span></strong><br/>
                            <span className="coffee">{coffee.description}</span><br/>
                            <img alt="140x140" className="rounded-circle img-thumbnail img-size" src={"https://techsquad.rocks/" + coffee.image} data-holder-rendered="true" />
                            <br/>
                        </div>
                    </div>
                </div>
            ));
            return <>
                    {listTokens}
                </>
        } catch (error) {
            console.error(error);
        }
    }
}

class App extends Component {
    state = {
        loaded: false,
    };

    componentDidMount = async () => {
        try {
            // Get network provider and web3 instance.
            this.web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            this.accounts = await this.web3.eth.getAccounts();

            // Get the contract instance.
            this.networkId = await this.web3.eth.net.getId();
            this.instance = new this.web3.eth.Contract(
                CoffeeContract.abi,
                CoffeeContract.networks[this.networkId] && CoffeeContract.networks[this.networkId].address,
            );

            this.listenToTokenTransfer();
            this.setState({
                loaded: true,
                coffeePrice: this.web3.utils.toWei("0.015", "ether"),
                userTokens: 0,
                listUserTokens: [],
            }, () => {
                this.updateUserTokens();
                this.listUserTokens();
               }
            );
        } catch (error) {
            alert(
                `Failed to load web3, accounts, or contract. Check console for details.`,
            );
            console.error(error);
        }
    };

    handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === "checkbox" ? target.checked : target.value
        const name = target.name;
        this.setState({
            [name]: value,
    })}


    handleGetCoffee = async () => {
        try {
            const randomCoffee = Math.floor(Math.random() * 7);
            this.instance.methods.awardCoffee(this.accounts[0], "https://techsquad.rocks/coffee/" + randomCoffee + ".json")
                .send({ from: this.accounts[0] });
            } catch (error) {
            alert(
                `Please make sure you have enough funds.`,
            );
            console.error(error);
        }
    }

    updateUserTokens = async() => {
        try {
            let userTokens = await this.instance.methods.balanceOf(this.accounts[0]).call();
            this.setState({ userTokens: userTokens });
        } catch (error) {
            console.error(error);
        }
    }

    listenToTokenTransfer = async() => {
        try {
            this.instance.events.Transfer({to: this.accounts[0]}).on("data", this.updateUserTokens);
            // this could be improved just to add the
            // new element to the state instead of rendering the whole thing
            // but for simplicity now it will be like that
            this.instance.events.Transfer({to: this.accounts[0]}).on("data", this.listUserTokens);
        } catch (error) {
            console.error(error);
        }
    }

    listUserTokens = async() => {
        try {
            let listUserTokens = [];
            this.instance.methods.balanceOf(this.accounts[0]).call().then((balance) => {
                for(let index = 0; index < balance; index++) {
                    this.instance.methods.tokenOfOwnerByIndex(this.accounts[0], index).call().then((id) => {
                        this.instance.methods.tokenURI(id).call().then((url) => {
                            fetch(url)
                                .then(response => response.json())
                                .then(data => this.setState({ userTokens: listUserTokens.push({ tokenId: id , ...data }) }))
                        })
                    })
                }
            })
            this.setState({ listUserTokens: listUserTokens });
        } catch (error) {
            console.error(error);
        }
    }

    render() {
        if (!this.state.loaded) {
            return <div>Loading Web3, accounts, and contract...</div>;
        }
        return (
            <div className="App">
                <h1>CryptoCoffee</h1>
                <p>You get a virtual coffee if you'd like, it will be highly appreciated</p>
                <p><strong>This is a collectible item (It might have 0 value elsewhere)</strong></p>
                Coffee price: {this.state.coffeePrice} Wei
                <br />
                <button type="button" className="btn btn-dark" onClick={this.handleGetCoffee}>Get coffee</button>

                <p>You have: {this.state.userTokens}</p>
                <div>
                    <ListUserTokens userTokens={this.state.listUserTokens} />
                </div>
            </div>
        );
    }
}

export default App;
