import useSWR from 'swr'

import {useState} from 'react'
import { Table, Input, Space, Typography, Spin, Button, Modal  } from 'antd';
const { Column } = Table;
import 'antd/dist/antd.css'; 
import { useRouter } from 'next/router';
import { faArrowDown19, faArrowDownAZ, faArrowUp19, faArrowUpAZ, faCoffee } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

let onClickSort;
let order = 'ASC';

export default function Index(){
    const [state, setState] = useState({url:'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json', titleSearchString:'', orderBy: {index: '', order: 'ASC'}});
    const [validate, setValidate] = useState({message: ''});
    const {data, error} = useSWR(`${state.url}&s=${state.titleSearchString}`, async (u) => {
        if (!state.url || state.url === '') {
            return {Results: ''};  
        }

        const res = await fetch(state.url);
        const json = await res.json();
        return json;
    });

    if(data && data.Results !== '') {
        data.Results = data.Results.filter(result => result.Make_Name.toUpperCase().indexOf(state.titleSearchString.toUpperCase()) > -1);
    }

    if(state.orderBy && state.orderBy.index !== '') {
        if (data && data.Results) {
            data.Results.sort((a, b) => {
                if (state.orderBy.order === 'ASC') {
                    return (a[state.orderBy.index] > b[state.orderBy.index]) ? 1 : -1;
                } else {
                    return (b[state.orderBy.index] > a[state.orderBy.index]) ? 1 : -1;
                }
            });
        }
    }

    onClickSort = (dataIndex) => {
        setState({
            url: 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json', 
            titleSearchString: state.titleSearchString, 
            orderBy: {index: dataIndex, order: state.orderBy.order === 'ASC' ? 'DESC' : 'ASC'}
        });

        order = state.orderBy.order === 'ASC' ? 'DESC' : 'ASC';
    }

    const onClickHandler = (e, type='search') => {
        e.preventDefault();
        let search = document.getElementById('titleSearchString').value;

        if (e.keyCode === 13 || type === 'show') {
            if (search === '') {
                setValidate({message: 'O campo de pesquisa é obrigatório.'});
            } else if (type === 'search'){    
                setState({
                    url: 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json', 
                    titleSearchString: search,
                    orderBy: state.orderBy
                });
                setValidate({message: ''});
            } else if (type === 'show'){
                if (state.url === '') {
                    setState({
                        url: 'https://vpic.nhtsa.dot.gov/api/vehicles/getallmakes?format=json', 
                        titleSearchString: state.titleSearchString,
                        orderBy: state.orderBy
                    });
                } else {
                    setState({
                        url: '', 
                        titleSearchString: state.titleSearchString,
                        orderBy: state.orderBy
                    });
                }
                setValidate({message: ''});
            }
        }
    }

    return (
        <div>
            <TheForm message={validate.message} handler={onClickHandler}/>
            <TheLink url={state.url} handler={onClickHandler}/>
            <TheMakes data={data ? data: {Results: ''} } show={state.url !== ''}/>
        </div>
    )
}

export function TheForm({message, handler}){
    return (
        <div className="space-align-container">
            <div className="space-align-block">
                <Space direction="horizontal" style={{width: '100%', justifyContent: 'center', padding: 10}}>
                    <Input
                        id='titleSearchString'
                        name='titleSearchString'
                        placeholder="Pesquise por marcas"
                        size="middle"
                        onKeyUp={handler}
                    />
                </Space>
                <Space direction="horizontal" style={{width: '100%', justifyContent: 'center', padding: 10}}>
                    <p style={{color: 'red'}}>{ message }</p>
                </Space>
            </div>
        </div>
    )

}

export function TheMakes({data,show}){
    const [isModalOpen, setIsModalOpen] = useState(null);
    const [make, setMake] = useState(null);

    const showModal = (make) => {
        setMake(make);
        setIsModalOpen(true);
    };

    const handleOk = () => {
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };
    
    if (!show || !data) return (<div></div>);    

    if (data.Error) {
        return (
            <Error error={data.Error}/>
        )
    }

    if (data.Results === '' ) {
        return <Spin/>
    }

    let dados = data.Results.map((m) => {
        return { 
            ...m,
            key: m.Make_ID
        };
    });

    return (
        <div>
            <Table onRow={(make) => {
                    return {
                        onClick: () => {
                            showModal(make)
                        },
                    };
                }} 
                dataSource={dados} 
                columns={columns}
            />  

            <MakeModal isModalOpen={isModalOpen} handleOk={handleOk} handleCancel={handleCancel} make={make}/>
        </div>
    )
}

const columns = [
    {
        title: () => <>ID <SortIcon dataIndex="Make_ID" type="number" /></>, 
        dataIndex: 'Make_ID',
        render: (_, make) => <a href={"make/" + make.key}>{make.key}</a>,
    },
    {
        title: () => <>Nome <SortIcon dataIndex="Make_Name"/></>, 
        dataIndex: 'Make_Name',
    },
];

export function MakeModal({isModalOpen, handleOk, handleCancel, make}){
    if (make) {
        return (
            <Modal title="Make Modal" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
                <p><strong>Make ID: </strong>{make.Make_ID}</p>
                <p><strong>Make Name: </strong>{make.Make_Name}</p>
            </Modal>
        );
    }
}

export function TheLink({url, handler}){    
    return (
        <div>
            <a style={{padding: 10}} onClick={event => handler(event, 'show')}> {url === '' ? 'Mostrar' : 'Ocultar'} </a>
        </div>
    );
}

export function GoBack() {
    const router = useRouter();
    return (<a onClick={() => router.back()}>Voltar</a>);
}

export function Error({error}) {
    return (
        <Typography.Title level={1} style={{ margin: 10 }}>
            {error}
        </Typography.Title>
    )
}

export function SortIcon({dataIndex, type="letter"}) {
    return (
        <Button onClick={() => onClickSort(dataIndex)} ghost="true" type="white" shape="circle" icon={<FontAwesomeIcon color='#1890ff' icon={type==='letter' ? (order === 'ASC' ? faArrowDownAZ : faArrowUpAZ) : (order === 'ASC' ? faArrowDown19 : faArrowUp19)} />}/>
    )
}
