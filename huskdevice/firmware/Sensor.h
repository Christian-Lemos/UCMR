#include <string>
#include <arduino.h>

#pragma once
class Sensor
{
protected:
	int GPIO;
	char* nome;
public:
	virtual char* executar() = 0;
	int intervalo; //Intervalo de envio de dados para o ucmr
	unsigned long ultimoIntervalo;
	int getGPIO() const;
	void setGPIO(int);
	char* getNome() const;
	void setNome(char*);
	explicit Sensor(int, char*);
	bool operator == (const Sensor &outro) const
	{
		return this->getGPIO() == outro.getGPIO();
	}
};
